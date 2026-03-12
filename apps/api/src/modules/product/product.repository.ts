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

  async getProductById(productId: string, branchId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('branch_id', branchId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllProducts(branchId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, product_categories(id, name, sort_order)')
      .eq('branch_id', branchId)
      .eq('is_deleted', false)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getActiveProducts(branchId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, product_categories(id, name, sort_order)')
      .eq('branch_id', branchId)
      .eq('is_deleted', false)
      .eq('is_active', true)
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true });

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
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDeleteProduct(productId: string, branchId: string) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ is_deleted: true })
      .eq('id', productId)
      .eq('branch_id', branchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProductsVisibility(
    branchId: string,
    productIds: string[],
    isHidden: boolean,
  ) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ is_hidden: isHidden })
      .eq('branch_id', branchId)
      .in('id', productIds);

    if (error) throw error;
    return data;
  }

  async getActiveProductsByOrgSlug(orgSlug: string) {
    const { data: org, error: orgError } = await this.supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: branch, error: branchError } = await this.supabase
      .from('branches')
      .select('id')
      .eq('organization_id', org.id)
      .eq('is_main', true)
      .eq('is_deleted', false)
      .single();

    if (branchError) throw branchError;

    return this.getActiveProducts(branch.id);
  }
}
