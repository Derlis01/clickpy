import { Injectable, Logger } from '@nestjs/common';

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  notes?: string;
  selected_options?: any[];
  selected_addons?: any[];
}

export interface GuestState {
  displayName: string;
  socketId: string | null; // null = disconnected
  guestId: string; // DB id
  cart: CartItem[];
  isReady: boolean;
  allergies?: string;
  isVirtual: boolean;
}

export interface SessionState {
  sessionId: string;
  branchId: string;
  currentRound: number;
  roundConfirmed: boolean;
  closed: boolean;
  guests: Map<string, GuestState>; // key = session_token
  tableName: string;
}

/**
 * In-memory state for all active sessions.
 * This is the source of truth for live session state (carts, ready status, etc).
 * DB is only updated at key moments (round confirmed, bill requested, etc).
 *
 * MVP: single server. Migration: Redis for multi-instance.
 */
@Injectable()
export class SessionStateManager {
  private readonly logger = new Logger(SessionStateManager.name);
  private sessions = new Map<string, SessionState>();

  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  getOrCreateSession(
    sessionId: string,
    branchId: string,
    tableName: string,
  ): SessionState {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        branchId,
        currentRound: 1,
        roundConfirmed: false,
        closed: false,
        guests: new Map(),
        tableName,
      };
      this.sessions.set(sessionId, session);
      this.logger.log(`Session created: ${sessionId}`);
    }
    return session;
  }

  addGuest(sessionId: string, token: string, state: GuestState): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.guests.set(token, state);
  }

  updateGuestSocket(
    sessionId: string,
    token: string,
    socketId: string | null,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const guest = session.guests.get(token);
    if (guest) guest.socketId = socketId;
  }

  getGuestBySocketId(
    sessionId: string,
    socketId: string,
  ): { token: string; guest: GuestState } | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    for (const [token, guest] of session.guests) {
      if (guest.socketId === socketId) return { token, guest };
    }
    return undefined;
  }

  findSessionBySocketId(
    socketId: string,
  ): { sessionId: string; token: string; guest: GuestState } | undefined {
    for (const [sessionId, session] of this.sessions) {
      for (const [token, guest] of session.guests) {
        if (guest.socketId === socketId) return { sessionId, token, guest };
      }
    }
    return undefined;
  }

  /** Get participants = guests with items in their cart */
  getParticipants(sessionId: string): Map<string, GuestState> {
    const session = this.sessions.get(sessionId);
    if (!session) return new Map();
    const result = new Map<string, GuestState>();
    for (const [token, guest] of session.guests) {
      if (guest.cart.length > 0) {
        result.set(token, guest);
      }
    }
    return result;
  }

  /** Get count of ready participants */
  getReadyCount(sessionId: string): number {
    const participants = this.getParticipants(sessionId);
    let count = 0;
    for (const guest of participants.values()) {
      if (guest.isReady) count++;
    }
    return count;
  }

  /** Check if all participants are ready */
  allReady(sessionId: string): boolean {
    const participants = this.getParticipants(sessionId);
    if (participants.size === 0) return false;
    for (const guest of participants.values()) {
      if (!guest.isReady) return false;
    }
    return true;
  }

  /** Collect items from ready guests for order creation */
  collectReadyItems(sessionId: string): {
    items: CartItem[];
    guestDetails: Map<string, GuestState>;
  } {
    const participants = this.getParticipants(sessionId);
    const items: CartItem[] = [];
    const guestDetails = new Map<string, GuestState>();

    for (const [token, guest] of participants) {
      if (guest.isReady) {
        items.push(...guest.cart);
        guestDetails.set(token, guest);
      }
    }

    return { items, guestDetails };
  }

  /** Reset round state after confirmation */
  resetRound(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.currentRound++;
    session.roundConfirmed = false;
    for (const guest of session.guests.values()) {
      guest.cart = [];
      guest.isReady = false;
    }
  }

  /** Clear carts of non-ready guests (countdown expired) */
  clearPendingCarts(sessionId: string): string[] {
    const participants = this.getParticipants(sessionId);
    const cleared: string[] = [];
    for (const [, guest] of participants) {
      if (!guest.isReady) {
        guest.cart = [];
        cleared.push(guest.displayName);
      }
    }
    return cleared;
  }

  /** Mark session as closed */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.closed = true;
  }

  /** Remove session from memory */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /** Get presence info for a session */
  getPresence(sessionId: string): {
    guests: Array<{
      display_name: string;
      is_ready: boolean;
      has_items: boolean;
      is_connected: boolean;
    }>;
    countdown: { ends_at: string } | null;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) return { guests: [], countdown: null };

    const guests = Array.from(session.guests.values()).map((g) => ({
      display_name: g.displayName,
      is_ready: g.isReady,
      has_items: g.cart.length > 0,
      is_connected: g.socketId !== null,
    }));

    return { guests, countdown: null }; // countdown filled by gateway
  }
}
