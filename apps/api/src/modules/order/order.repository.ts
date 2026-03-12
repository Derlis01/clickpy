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
}
