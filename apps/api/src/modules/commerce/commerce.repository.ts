import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CommerceRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async getCommerceById(commerceId: string) {
    const { data, error } = await this.supabase
      .from('commerces')
      .select('*')
      .eq('id', commerceId)
      .single();

    if (error) throw error;
    return data;
  }

  async getCommerceBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('commerces')
      .select('*')
      .eq('commerce_slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  async updateCommerce(commerceId: string, updateData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('commerces')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', commerceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCheckoutConfiguration(
    commerceId: string,
    paymentMethods: Record<string, any>,
    shippingMethods: Record<string, any>,
  ) {
    const { data, error } = await this.supabase
      .from('commerces')
      .update({
        payment_methods: paymentMethods,
        shipping_methods: shippingMethods,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commerceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProductsCount(commerceId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('commerces')
      .select('products_count')
      .eq('id', commerceId)
      .single();

    if (error) throw error;
    return data.products_count ?? 0;
  }
}
