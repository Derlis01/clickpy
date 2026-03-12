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

  async getOrganizationById(organizationId: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) throw error;
    return data;
  }

  async getOrganizationBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrganization(
    organizationId: string,
    updateData: Record<string, any>,
  ) {
    const { data, error } = await this.supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBranchesByOrganization(organizationId: string) {
    const { data, error } = await this.supabase
      .from('branches')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_deleted', false)
      .order('is_main', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getBranchById(branchId: string) {
    const { data, error } = await this.supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBranch(branchId: string, updateData: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('branches')
      .update(updateData)
      .eq('id', branchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProductsCountByOrganization(
    organizationId: string,
  ): Promise<number> {
    const { data: branches } = await this.supabase
      .from('branches')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_deleted', false);

    if (!branches || branches.length === 0) return 0;

    const branchIds = branches.map((b) => b.id);

    const { count, error } = await this.supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .in('branch_id', branchIds)
      .eq('is_deleted', false);

    if (error) throw error;
    return count ?? 0;
  }
}
