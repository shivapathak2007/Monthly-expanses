import { db } from '../config/db.js';

export class GoalModel {
  static async create({ userId, name, target_amount, current_amount = 0, deadline = null }) {
    const { data, error } = await db
      .from('financial_goals')
      .insert({
        user_id: userId,
        name: name.trim(),
        target_amount: Number(target_amount),
        current_amount: Number(current_amount) || 0,
        deadline: deadline || null
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id, userId) {
    const { data, error } = await db
      .from('financial_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding goal by ID:', error);
    }
    return data || null;
  }

  static async findAll(userId) {
    const { data, error } = await db
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async update(id, userId, updates) {
    const allowed = ['name', 'target_amount', 'current_amount', 'deadline'];
    const filtered = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'target_amount' || key === 'current_amount') {
          filtered[key] = Number(updates[key]);
        } else {
          filtered[key] = updates[key];
        }
      }
    }

    const { data, error } = await db
      .from('financial_goals')
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
      .from('financial_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

export default GoalModel;
