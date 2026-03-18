import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SessionStateManager,
  CartItem,
  SessionState,
} from './session-state.manager';
import { CountdownManager } from './countdown.manager';
import { SessionLockService } from './session-lock.service';
import { TableSessionService } from '../table-session/table-session.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly state: SessionStateManager,
    private readonly countdown: CountdownManager,
    private readonly lock: SessionLockService,
    private readonly sessionService: TableSessionService,
  ) {}

  // ── Connection lifecycle ──

  async handleConnection(socket: Socket) {
    const auth = socket.handshake.auth;
    const role = auth.role as string | undefined;

    if (role === 'kitchen') {
      const branchId = auth.branch_id as string;
      socket.join(`kitchen:${branchId}`);
      socket.data = { role: 'kitchen', branchId };
      this.logger.log(`Kitchen connected: ${socket.id} (branch: ${branchId})`);
      return;
    }

    if (role === 'staff') {
      const branchId = auth.branch_id as string;
      socket.join(`floor:${branchId}`);
      socket.data = { role: 'staff', branchId };
      this.logger.log(`Staff connected: ${socket.id} (branch: ${branchId})`);
      return;
    }

    // Guest connection
    const sessionId = auth.session_id as string;
    const token = auth.session_token as string;
    const displayName = (auth.display_name as string) ?? 'Guest';

    if (!sessionId || !token) {
      socket.disconnect();
      return;
    }

    // Get or create session in memory + DB
    let session = this.state.getSession(sessionId);
    if (!session) {
      // Try to get session info from DB
      try {
        const dbSession = await this.sessionService.getSession(sessionId);
        if (dbSession && dbSession.status === 'closed') {
          socket.emit('connect_error', { message: 'Session is closed' });
          socket.disconnect();
          return;
        }
        const branchId = dbSession?.branch_id ?? 'unknown';
        const tableName = `Mesa ${sessionId.slice(-4)}`;
        session = this.state.getOrCreateSession(sessionId, branchId, tableName);
      } catch {
        // Session doesn't exist in DB yet — create in memory, DB will be created on first action
        session = this.state.getOrCreateSession(
          sessionId,
          'unknown',
          `Mesa ${sessionId.slice(-4)}`,
        );
      }
    }

    if (session.closed) {
      socket.emit('cart:error', {
        code: 'SESSION_CLOSED',
        message: 'Session is closed',
      });
      socket.disconnect();
      return;
    }

    // Register or reconnect guest
    const existingGuest = session.guests.get(token);
    if (existingGuest) {
      // Reconnection — update socket ID
      existingGuest.socketId = socket.id;
      this.logger.log(`Guest reconnected: ${displayName} (${socket.id})`);
    } else {
      // New guest — register in DB and memory
      let guestId = 'pending';
      try {
        const guest = await this.sessionService.joinSession(
          sessionId,
          token,
          displayName,
        );
        guestId = guest.id;
      } catch {
        // DB might not be ready in tests
      }

      this.state.addGuest(sessionId, token, {
        displayName,
        socketId: socket.id,
        guestId,
        cart: [],
        isReady: false,
        isVirtual: false,
      });
    }

    socket.join(`table:${sessionId}`);
    socket.data = { role: 'guest', sessionId, token, displayName };

    // Send presence to the connecting guest
    const presence = this.state.getPresence(sessionId);
    const countdownEnd = this.countdown.getEndsAt(sessionId);
    if (countdownEnd) {
      presence.countdown = { ends_at: countdownEnd.toISOString() };
    }
    socket.emit('guest:presence', presence);

    // Notify others
    if (!existingGuest) {
      socket.to(`table:${sessionId}`).emit('guest:joined', {
        display_name: displayName,
        guest_id: session.guests.get(token)?.guestId,
      });
    }

    this.logger.log(`Guest connected: ${displayName} -> session ${sessionId}`);
  }

  handleDisconnect(socket: Socket) {
    const data = socket.data;
    if (!data || data.role !== 'guest') return;

    const { sessionId, token, displayName } = data;
    this.state.updateGuestSocket(sessionId, token, null);

    socket.to(`table:${sessionId}`).emit('guest:left', {
      display_name: displayName,
    });

    this.logger.log(`Guest disconnected: ${displayName} (${socket.id})`);
  }

  // ── Cart events ──

  @SubscribeMessage('cart:update')
  async handleCartUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      action: 'add' | 'remove';
      product_id: string;
      product_name?: string;
      quantity?: number;
      price?: number;
      notes?: string;
      round?: number;
    },
  ) {
    const { sessionId, token, displayName } = socket.data;
    const session = this.state.getSession(sessionId);
    if (!session) return;

    if (session.closed) {
      socket.emit('cart:error', {
        code: 'SESSION_CLOSED',
        message: 'Session is closed',
      });
      return;
    }

    const guest = session.guests.get(token);
    if (!guest) return;

    const release = await this.lock.acquire(sessionId);
    try {
      if (payload.action === 'add') {
        const item: CartItem = {
          product_id: payload.product_id,
          product_name: payload.product_name ?? '',
          price: payload.price ?? 0,
          quantity: payload.quantity ?? 1,
          notes: payload.notes,
        };
        guest.cart.push(item);

        socket.to(`table:${sessionId}`).emit('cart:item_added', {
          guest_name: displayName,
          product_id: payload.product_id,
          product_name: payload.product_name,
          quantity: payload.quantity ?? 1,
        });

        // Notify floor
        this.server
          .to(`floor:${session.branchId}`)
          .emit('floor:table_updated', {
            session_id: sessionId,
            table_name: session.tableName,
            action: 'item_added',
          });

        // If countdown active and this is a new participant adding items, reset
        if (this.countdown.isActive(sessionId) && !guest.isReady) {
          this.countdown.cancel(sessionId);
          this.server.to(`table:${sessionId}`).emit('countdown:reset', {
            reason: 'new_guest_with_items',
          });
        }
      } else if (payload.action === 'remove') {
        // Check if item is from a confirmed round
        if (
          payload.round !== undefined &&
          payload.round < session.currentRound
        ) {
          socket.emit('cart:error', {
            code: 'ALREADY_IN_KITCHEN',
            message: 'Item already sent to kitchen',
          });
          return;
        }

        const idx = guest.cart.findIndex(
          (i) => i.product_id === payload.product_id,
        );
        if (idx >= 0) {
          guest.cart.splice(idx, 1);
          socket.to(`table:${sessionId}`).emit('cart:item_removed', {
            guest_name: displayName,
            product_id: payload.product_id,
          });
        }
      }
    } finally {
      release();
    }
  }

  // ── Round events ──

  @SubscribeMessage('round:ready')
  async handleRoundReady(@ConnectedSocket() socket: Socket) {
    const { sessionId, token, displayName } = socket.data;
    const session = this.state.getSession(sessionId);
    if (!session) return;

    const guest = session.guests.get(token);
    if (!guest) return;

    // Must have items to confirm
    if (guest.cart.length === 0) {
      socket.emit('round:error', {
        code: 'EMPTY_CART',
        message: 'No items in cart',
      });
      return;
    }

    const release = await this.lock.acquire(sessionId);
    try {
      if (session.roundConfirmed) return; // Already confirmed this round

      guest.isReady = true;
      const participants = this.state.getParticipants(sessionId);
      const totalParticipants = participants.size;
      const readyCount = this.state.getReadyCount(sessionId);

      // Mesa de 1: sale directo
      if (totalParticipants === 1) {
        await this.confirmRound(sessionId, session);
        return;
      }

      // Ronda 2+: libre, cada uno confirma solo
      if (session.currentRound > 1) {
        await this.confirmRoundForGuest(sessionId, session, token);
        return;
      }

      // Ronda 1: consenso
      if (readyCount === totalParticipants) {
        // All ready → confirm
        this.countdown.cancel(sessionId);
        await this.confirmRound(sessionId, session);
      } else if (this.countdown.shouldStart(totalParticipants, readyCount)) {
        // Start countdown
        const endsAt = this.countdown.start(sessionId, () => {
          this.handleCountdownExpiry(sessionId);
        });
        this.server.to(`table:${sessionId}`).emit('countdown:started', {
          ends_at: endsAt.toISOString(),
        });
      } else {
        // Notify others that this guest is ready
        socket.to(`table:${sessionId}`).emit('round:guest_ready', {
          guest_name: displayName,
        });
      }
    } finally {
      release();
    }
  }

  @SubscribeMessage('round:unready')
  handleRoundUnready(@ConnectedSocket() socket: Socket) {
    const { sessionId, token, displayName } = socket.data;
    const session = this.state.getSession(sessionId);
    if (!session) return;

    const guest = session.guests.get(token);
    if (!guest) return;

    guest.isReady = false;

    if (this.countdown.isActive(sessionId)) {
      this.countdown.cancel(sessionId);
      this.server.to(`table:${sessionId}`).emit('countdown:reset', {
        reason: 'guest_unready',
      });
    }

    socket.to(`table:${sessionId}`).emit('round:guest_unready', {
      guest_name: displayName,
    });
  }

  // ── Internal: Confirm round ──

  private async confirmRound(sessionId: string, session: SessionState) {
    if (session.roundConfirmed) return;
    session.roundConfirmed = true;

    const { items, guestDetails } = this.state.collectReadyItems(sessionId);

    // Validate products
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const validation = await this.sessionService.validateProducts(productIds);
    if (!validation.valid) {
      session.roundConfirmed = false;
      // Notify the guests who have the unavailable product
      for (const [, guest] of guestDetails) {
        if (
          guest.socketId &&
          guest.cart.some((i) => i.product_id === validation.unavailable)
        ) {
          this.server.to(guest.socketId).emit('round:error', {
            code: 'PRODUCT_UNAVAILABLE',
            product_id: validation.unavailable,
          });
        }
      }
      return;
    }

    // Build order items with guest info
    const orderItems = items.map((item) => {
      let guestName = 'Unknown';
      let guestId: string | undefined;
      let guestAllergies: string | undefined;
      for (const [, g] of guestDetails) {
        if (g.cart.includes(item)) {
          guestName = g.displayName;
          guestId = g.guestId;
          guestAllergies = g.allergies;
          break;
        }
      }
      return {
        ...item,
        status: 'confirmed',
        guest_name: guestName,
        guest_id: guestId,
        guest_allergies: guestAllergies,
        selected_options: item.selected_options ?? [],
        selected_addons: item.selected_addons ?? [],
      };
    });

    // Create order in DB (best-effort — round proceeds even if DB fails)
    let orderId: string | null = null;
    try {
      const order = await this.sessionService.createRoundOrder(
        sessionId,
        session.branchId,
        session.currentRound,
        orderItems,
      );
      orderId = order.id;
    } catch (err) {
      this.logger.error(`Failed to persist order (round proceeds): ${err}`);
    }

    const roundNumber = session.currentRound;

    // Broadcast to table
    this.server.to(`table:${sessionId}`).emit('round:confirmed', {
      round: roundNumber,
      order_id: orderId,
      items: orderItems,
    });

    // Broadcast to kitchen
    this.server.to(`kitchen:${session.branchId}`).emit('kitchen:new_order', {
      order_id: orderId,
      session_id: sessionId,
      table_name: session.tableName,
      source: 'table',
      items: orderItems,
      round: roundNumber,
    });

    // Broadcast to floor
    this.server.to(`floor:${session.branchId}`).emit('floor:table_updated', {
      session_id: sessionId,
      table_name: session.tableName,
      action: 'round_confirmed',
      round: roundNumber,
    });

    // Reset round state
    this.state.resetRound(sessionId);

    // Log (best-effort)
    this.sessionService.log(session.branchId, 'round_confirmed', sessionId, {
      round: roundNumber,
      items: orderItems.length,
    });
  }

  /** Confirm round for a single guest (ronda 2+ libre) */
  private async confirmRoundForGuest(
    sessionId: string,
    session: SessionState,
    token: string,
  ) {
    if (session.roundConfirmed) return;

    const guest = session.guests.get(token);
    if (!guest || guest.cart.length === 0) return;

    // Validate products
    const productIds = guest.cart.map((i) => i.product_id);
    const validation = await this.sessionService.validateProducts(productIds);
    if (!validation.valid) {
      if (guest.socketId) {
        this.server.to(guest.socketId).emit('round:error', {
          code: 'PRODUCT_UNAVAILABLE',
          product_id: validation.unavailable,
        });
      }
      return;
    }

    const orderItems = guest.cart.map((item) => ({
      ...item,
      status: 'confirmed',
      guest_name: guest.displayName,
      guest_id: guest.guestId,
      guest_allergies: guest.allergies,
      selected_options: item.selected_options ?? [],
      selected_addons: item.selected_addons ?? [],
    }));

    let orderId: string | null = null;
    try {
      const order = await this.sessionService.createRoundOrder(
        sessionId,
        session.branchId,
        session.currentRound,
        orderItems,
      );
      orderId = order.id;
    } catch (err) {
      this.logger.error(`Failed to persist order (round proceeds): ${err}`);
    }

    const roundNumber = session.currentRound;

    this.server.to(`table:${sessionId}`).emit('round:confirmed', {
      round: roundNumber,
      order_id: orderId,
      items: orderItems,
    });

    this.server.to(`kitchen:${session.branchId}`).emit('kitchen:new_order', {
      order_id: orderId,
      session_id: sessionId,
      table_name: session.tableName,
      source: 'table',
      items: orderItems,
      round: roundNumber,
    });

    // Clear only this guest's cart, increment round
    guest.cart = [];
    guest.isReady = false;
    session.currentRound++;
  }

  // ── Internal: Countdown expiry ──

  private async handleCountdownExpiry(sessionId: string) {
    const release = await this.lock.acquire(sessionId);
    try {
      const session = this.state.getSession(sessionId);
      if (!session || session.roundConfirmed) return;

      const cleared = this.state.clearPendingCarts(sessionId);

      this.server.to(`table:${sessionId}`).emit('countdown:expired', {
        cleared_guests: cleared,
      });

      await this.confirmRound(sessionId, session);
    } finally {
      release();
    }
  }

  // ── Public API for REST controllers ──

  /** Broadcast an event to a table room */
  broadcastToTable(sessionId: string, event: string, data: any): void {
    this.server.to(`table:${sessionId}`).emit(event, data);
  }

  /** Broadcast to kitchen room */
  broadcastToKitchen(branchId: string, event: string, data: any): void {
    this.server.to(`kitchen:${branchId}`).emit(event, data);
  }

  /** Broadcast to floor room */
  broadcastToFloor(branchId: string, event: string, data: any): void {
    this.server.to(`floor:${branchId}`).emit(event, data);
  }

  /** Trigger round confirmation from REST (staff) */
  async triggerConfirmRound(sessionId: string): Promise<void> {
    const release = await this.lock.acquire(sessionId);
    try {
      const session = this.state.getSession(sessionId);
      if (!session) return;
      // Mark all guests with items as ready
      const participants = this.state.getParticipants(sessionId);
      for (const guest of participants.values()) {
        guest.isReady = true;
      }
      await this.confirmRound(sessionId, session);
    } finally {
      release();
    }
  }

  /** Add items to a guest's cart from staff REST endpoint */
  addStaffItems(sessionId: string, guestName: string, items: any[]): void {
    const session = this.state.getSession(sessionId);
    if (!session) return;

    for (const [, guest] of session.guests) {
      if (guest.displayName === guestName) {
        for (const item of items) {
          guest.cart.push({
            product_id: item.product_id,
            product_name: item.product_name,
            price: item.price ?? 0,
            quantity: item.quantity ?? 1,
            notes: item.notes,
          });
        }
        break;
      }
    }
  }
}
