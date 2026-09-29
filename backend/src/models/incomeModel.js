import { db } from '../config/db.js';

export class IncomeModel {
  static async create({ userId, amount, source, description = '', income_date }) {
    const { data, error } = await db
      .from('income')
      .insert({
        user_id: userId,
        amount: Number(amount),
        source,
        description: description ? description.trim() : '',
        income_date: income_date || new Date().toISOString().split('T')[0]
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id, userId) {
    const { data, error } = await db
      .from('income')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding income by ID:', error);
    }
    return data || null;
  }

  static async findAll({ userId, page = 1, limit = 50 }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const { data, count, error } = await db
      .from('income')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('income_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    const total = count !== null && count !== undefined ? count : (data ? data.length : 0);

    return {
      data: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  static async findByDateRange(userId, startDate, endDate) {
    let query = db
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: true });

    if (startDate) query = query.gte('income_date', startDate);
    if (endDate) query = query.lte('income_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async update(id, userId, updates) {
    const allowed = ['amount', 'source', 'description', 'income_date'];
    const filtered = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'amount') filtered.amount = Number(updates.amount);
        else filtered[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('income')
      .update(filtered)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id, userId) {
    const { error } = await db
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  static async bulkDelete(ids, userId) {
    if (!Array.isArray(ids) || ids.length === 0) return 0;
    const { error } = await db
      .from('income')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) throw error;
    return ids.length;
  }
}

export default IncomeModel;
