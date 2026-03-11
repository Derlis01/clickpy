import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CustomerRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async getCustomerByPhone(commerceId: string, phone: string) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('commerce_id', commerceId)
      .eq('customer_phone', phone)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createCustomer(customerData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(
    commerceId: string,
    phone: string,
    updateData: Record<string, any>,
  ) {
    const { data, error } = await this.supabase
      .from('customers')
      .update(updateData)
      .eq('commerce_id', commerceId)
      .eq('customer_phone', phone)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
