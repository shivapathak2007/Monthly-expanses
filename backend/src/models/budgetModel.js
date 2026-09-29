import { db } from '../config/db.js';

export class BudgetModel {
  static async create({ userId, category, amount, month, year }) {
    const { data, error } = await db
      .from('budgets')
      .insert({
        user_id: userId,
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year)
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id, userId) {
    const { data, error } = await db
      .from('budgets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding budget by ID:', error);
    }
    return data || null;
  }

  static async findAll(userId, month, year) {
    let query = db.from('budgets').select('*').eq('user_id', userId);

    if (month) query = query.eq('month', Number(month));
    if (year) query = query.eq('year', Number(year));

    const { data, error } = await query.order('category', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async findByCategory(userId, category, month, year) {
    const { data, error } = await db
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('month', Number(month))
      .eq('year', Number(year))
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding budget by category:', error);
    }
    return data || null;
  }

  static async update(id, userId, { amount, category, month, year }) {
    const updates = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (category !== undefined) updates.category = category;
    if (month !== undefined) updates.month = Number(month);
    if (year !== undefined) updates.year = Number(year);

    const { data, error } = await db
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id, userId) {
    const { error } = await db
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

export default BudgetModel;
