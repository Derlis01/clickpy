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

  async getCustomerByPhone(organizationId: string, phone: string) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('phone', phone)
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
    organizationId: string,
    phone: string,
    updateData: Record<string, any>,
  ) {
    const { data, error } = await this.supabase
      .from('customers')
      .update(updateData)
      .eq('organization_id', organizationId)
      .eq('phone', phone)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
