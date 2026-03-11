import { supabase } from './supabase';

export class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(item) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  async query(column, operator, value) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .filter(column, operator, value);
    if (error) throw error;
    return data;
  }

  async customQuery(queryFn) {
    const { data, error } = await queryFn(supabase.from(this.tableName));
    if (error) throw error;
    return data;
  }
}
