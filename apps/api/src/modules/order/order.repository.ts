import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class OrderRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async getOrganizationIdByBranch(branchId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('branches')
      .select('organization_id')
      .eq('id', branchId)
      .eq('is_deleted', false)
      .single();

    if (error || !data) throw error ?? new Error('Branch not found');
    return data.organization_id;
  }

  async createOrder(orderData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByBranch(
    branchId: string,
    filters?: {
      status?: string;
      type?: string;
      from?: string;
      to?: string;
    },
  ) {
    let query = this.supabase
      .from('orders')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.from) {
      query = query.gte('created_at', filters.from);
    }
    if (filters?.to) {
      query = query.lte('created_at', filters.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async findById(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(
    orderId: string,
    status: string,
    cancellationReason?: string,
  ) {
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (cancellationReason) {
      updateData.cancellation_reason = cancellationReason;
    }

    const { data, error } = await this.supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
