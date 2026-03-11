import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ProductRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async getProductById(productId: string, commerceId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('commerce_id', commerceId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllProducts(commerceId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('commerce_id', commerceId)
      .eq('is_deleted', false);

    if (error) throw error;
    return data;
  }

  async getActiveProducts(commerceId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('commerce_id', commerceId)
      .eq('is_deleted', false)
      .eq('is_active', true)
      .eq('is_hidden', false);

    if (error) throw error;
    return data;
  }

  async createProduct(productData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, updateData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDeleteProduct(productId: string, commerceId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('commerce_id', commerceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProductsVisibility(
    commerceId: string,
    productIds: string[],
    isHidden: boolean,
  ) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        is_hidden: isHidden,
        updated_at: new Date().toISOString(),
      })
      .eq('commerce_id', commerceId)
      .in('id', productIds);

    if (error) throw error;
    return data;
  }

  async updateProductsCategory(
    commerceId: string,
    productIds: string[],
    newCategory: string,
  ) {
    const { data, error } = await this.supabase
      .from('products')
      .update({
        category: newCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('commerce_id', commerceId)
      .in('id', productIds)
      .select();

    if (error) throw error;
    return data;
  }

  async getProductBySlugAndId(commerceSlug: string, productId: string) {
    // First get the commerce by slug
    const { data: commerce, error: commerceError } = await this.supabase
      .from('commerces')
      .select('id')
      .eq('commerce_slug', commerceSlug)
      .single();

    if (commerceError) throw commerceError;

    // Then get the product
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('commerce_id', commerce.id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }
}
