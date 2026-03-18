import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class TableRepository {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.secretKey')!,
    );
  }

  async create(data: {
    branch_id: string;
    name: string;
    number?: number;
    capacity?: number;
  }) {
    const { data: table, error } = await this.supabase
      .from('tables')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return table;
  }

  async findByBranch(branchId: string) {
    const { data, error } = await this.supabase
      .from('tables')
      .select()
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .order('number', { ascending: true });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('tables')
      .select()
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      number: number;
      capacity: number;
      is_active: boolean;
    }>,
  ) {
    const { data: table, error } = await this.supabase
      .from('tables')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return table;
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('tables')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }
}
