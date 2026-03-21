import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TableSessionRepository } from './table-session.repository';

@Injectable()
export class TableSessionService {
  constructor(private readonly repo: TableSessionRepository) {}

  /** Get or create active session for a table */
  async getOrCreateSession(tableId: string) {
    const table = await this.repo.findTableById(tableId);
    if (!table) throw new NotFoundException('Table not found');

    let session = await this.repo.findActiveByTable(tableId);
    if (!session) {
      session = await this.repo.createSession(tableId, table.branch_id);
    }
    return { ...session, table_number: table.number, table_name: table.name };
  }

  /** Join a session (register guest) */
  async joinSession(
    sessionId: string,
    token: string,
    name: string,
    allergies?: string,
  ) {
    const session = await this.repo.findById(sessionId);
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'closed')
      throw new BadRequestException('Session is closed');

    // Check if guest already exists with this token
    let guest = await this.repo.findGuestByToken(sessionId, token);
    if (guest) return guest;

    guest = await this.repo.createGuest({
      session_id: sessionId,
      session_token: token,
      display_name: name,
      allergies,
    });
    return guest;
  }

  /** Update guest allergies */
  async updateAllergies(
    sessionId: string,
    guestToken: string,
    allergies: string,
  ) {
    const guest = await this.repo.findGuestByToken(sessionId, guestToken);
    if (!guest) throw new NotFoundException('Guest not found');
    return this.repo.updateGuest(guest.id, { allergies });
  }

  /** Request bill for a guest */
  async requestBill(sessionId: string, guestToken: string) {
    const session = await this.repo.findById(sessionId);
    if (!session) throw new NotFoundException('Session not found');

    const guest = await this.repo.findGuestByToken(sessionId, guestToken);
    if (!guest) throw new NotFoundException('Guest not found');

    // Calculate amount due from orders
    const orders = await this.repo.findOrdersBySession(sessionId);
    let amountDue = 0;
    for (const order of orders) {
      for (const item of order.items ?? []) {
        if (item.guest_id === guest.id) {
          amountDue += item.price * item.quantity;
        }
      }
    }

    await this.repo.updateGuest(guest.id, { amount_due: amountDue });

    return {
      guest_id: guest.id,
      guest_name: guest.display_name,
      amount_due: amountDue,
      session_id: sessionId,
    };
  }

  /** Get orders for a session */
  async getSessionOrders(sessionId: string) {
    return this.repo.findOrdersBySession(sessionId);
  }

  /** Create an order from confirmed round items */
  async createRoundOrder(
    sessionId: string,
    branchId: string,
    roundNumber: number,
    items: any[],
  ) {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await this.repo.createOrder({
      branch_id: branchId,
      table_session_id: sessionId,
      round_number: roundNumber,
      items,
      subtotal: total,
      total,
      delivery_fee: 0,
      currency: 'PYG',
      status: 'confirmed',
      type: 'dinein',
      payment_method: 'cash',
      payment_status: 'pending',
      notes: '',
      customer_phone: '',
      customer_name: '',
    });

    return order;
  }

  /** Mark guest payment */
  async markPayment(
    sessionId: string,
    guestId: string,
    status: 'paid' | 'not_paid',
  ) {
    const guest = await this.repo.findGuestById(guestId);
    if (!guest) throw new NotFoundException('Guest not found');
    if (guest.session_id !== sessionId)
      throw new BadRequestException('Guest not in this session');

    await this.repo.updateGuest(guestId, { payment_status: status });

    // Check if all guests paid → close session
    const allGuests = await this.repo.findGuestsBySession(sessionId);
    const allPaid = allGuests.every((g) => g.payment_status === 'paid');

    if (allPaid && allGuests.length > 0) {
      await this.repo.closeSession(sessionId);
      return { guest, allPaid: true };
    }

    return { guest, allPaid: false };
  }

  /** Add virtual guest (waiter action) */
  async addVirtualGuest(sessionId: string, displayName: string) {
    const virtualToken = `virtual_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return this.repo.createGuest({
      session_id: sessionId,
      session_token: virtualToken,
      display_name: displayName,
      is_virtual: true,
    });
  }

  /** Remove guest */
  async removeGuest(sessionId: string, guestId: string) {
    const guest = await this.repo.findGuestById(guestId);
    if (!guest) throw new NotFoundException('Guest not found');
    if (guest.session_id !== sessionId)
      throw new BadRequestException('Guest not in this session');
    await this.repo.deleteGuest(guestId);
    return guest;
  }

  /** Create order on behalf of guest (waiter) */
  async createStaffOrder(sessionId: string, guestName: string, items: any[]) {
    const session = await this.repo.findById(sessionId);
    if (!session) throw new NotFoundException('Session not found');

    const guests = await this.repo.findGuestsBySession(sessionId);
    const guest = guests.find((g) => g.display_name === guestName);

    // Store items temporarily — they'll be used when the round is confirmed
    // For staff orders, we return the items so the caller can add them to session state
    return { guest, items, sessionId };
  }

  /** Validate products are available */
  async validateProducts(
    productIds: string[],
  ): Promise<{ valid: boolean; unavailable?: string }> {
    try {
      for (const id of productIds) {
        const product = await this.repo.findProductById(id);
        if (!product || !product.is_active) {
          return { valid: false, unavailable: id };
        }
      }
      return { valid: true };
    } catch {
      // DB error (e.g. invalid UUID) — skip validation
      return { valid: true };
    }
  }

  /** Get active orders for kitchen */
  async getKitchenOrders(branchId: string) {
    return this.repo.findActiveOrdersByBranch(branchId);
  }

  /** Update item status in order */
  async updateItemStatus(orderId: string, itemIndex: number, status: string) {
    const order = await this.repo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const items = [...order.items];
    if (itemIndex < 0 || itemIndex >= items.length) {
      throw new BadRequestException('Invalid item index');
    }

    items[itemIndex] = { ...items[itemIndex], status };

    const updated = await this.repo.updateOrder(orderId, { items });
    return { order: updated, sessionId: order.table_session_id };
  }

  /** Get session by ID */
  async getSession(sessionId: string) {
    return this.repo.findById(sessionId);
  }

  /** Get guests for a session */
  async getGuests(sessionId: string) {
    return this.repo.findGuestsBySession(sessionId);
  }

  /** Log event */
  async log(branchId: string, event: string, sessionId?: string, data?: any) {
    await this.repo
      .createLog({ branch_id: branchId, session_id: sessionId, event, data })
      .catch(() => {
        // Don't fail operations because of logging
      });
  }
}
