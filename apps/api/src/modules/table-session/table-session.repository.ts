import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TableSessionRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  // ── Sessions ──

  async findActiveByTable(tableId: string) {
    const { data, error } = await this.supabase
      .from('table_sessions')
      .select()
      .eq('table_id', tableId)
      .eq('status', 'active')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('table_sessions')
      .select()
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createSession(tableId: string, branchId: string) {
    const { data, error } = await this.supabase
      .from('table_sessions')
      .insert({
        table_id: tableId,
        branch_id: branchId,
        status: 'active',
        current_round: 1,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSession(id: string, updates: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('table_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async closeSession(id: string) {
    return this.updateSession(id, {
      status: 'closed',
      closed_at: new Date().toISOString(),
    });
  }

  // ── Guests ──

  async findGuestByToken(sessionId: string, token: string) {
    const { data, error } = await this.supabase
      .from('table_guests')
      .select()
      .eq('session_id', sessionId)
      .eq('session_token', token)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findGuestById(id: string) {
    const { data, error } = await this.supabase
      .from('table_guests')
      .select()
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findGuestsBySession(sessionId: string) {
    const { data, error } = await this.supabase
      .from('table_guests')
      .select()
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async createGuest(data: {
    session_id: string;
    session_token: string;
    display_name: string;
    allergies?: string;
    is_virtual?: boolean;
  }) {
    const { data: guest, error } = await this.supabase
      .from('table_guests')
      .insert({
        ...data,
        is_virtual: data.is_virtual ?? false,
        payment_status: 'pending',
        amount_due: 0,
        tip_amount: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return guest;
  }

  async updateGuest(id: string, updates: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('table_guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteGuest(id: string) {
    const { error } = await this.supabase
      .from('table_guests')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // ── Orders ──

  async createOrder(data: Record<string, any>) {
    const { data: order, error } = await this.supabase
      .from('orders')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return order;
  }

  async findOrdersBySession(sessionId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select()
      .eq('table_session_id', sessionId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async findOrderById(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select()
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  }

  async updateOrder(orderId: string, updates: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findActiveOrdersByBranch(branchId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, table_sessions!inner(id, branch_id, status)')
      .eq('table_sessions.branch_id', branchId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .not('table_session_id', 'is', null)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  // ── Logs ──

  async createLog(data: {
    branch_id: string;
    session_id?: string;
    event: string;
    data?: any;
  }) {
    const { error } = await this.supabase.from('table_logs').insert(data);
    if (error) throw error;
  }

  // ── Products (validation) ──

  async findProductById(productId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, is_active, name, price')
      .eq('id', productId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // ── Tables ──

  async findTableById(tableId: string) {
    const { data, error } = await this.supabase
      .from('tables')
      .select()
      .eq('id', tableId)
      .single();
    if (error) throw error;
    return data;
  }
}
