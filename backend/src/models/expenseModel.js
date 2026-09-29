import { db } from '../config/db.js';

export class ExpenseModel {
  static async create({ userId, amount, category, description, expense_date, payment_method, expense_type, notes = '' }) {
    const { data, error } = await db
      .from('expenses')
      .insert({
        user_id: userId,
        amount: Number(amount),
        category,
        description: description.trim(),
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        payment_method,
        expense_type: (expense_type || 'want').toLowerCase(),
        notes: notes ? notes.trim() : ''
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id, userId) {
    const { data, error } = await db
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error finding expense by ID:', error);
    }
    return data || null;
  }

  static async findAll({
    userId,
    category,
    paymentMethod,
    expenseType,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    sortBy = 'newest',
    page = 1,
    limit = 20
  }) {
    let query = db.from('expenses').select('*', { count: 'exact' }).eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    if (expenseType) {
      query = query.eq('expense_type', expenseType.toLowerCase());
    }

    if (startDate) {
      query = query.gte('expense_date', startDate);
    }

    if (endDate) {
      query = query.lte('expense_date', endDate);
    }

    if (minAmount !== undefined && minAmount !== '') {
      query = query.gte('amount', Number(minAmount));
    }

    if (maxAmount !== undefined && maxAmount !== '') {
      query = query.lte('amount', Number(maxAmount));
    }

    if (search && search.trim()) {
      query = query.ilike('description', `%${search.trim()}%`);
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('expense_date', { ascending: true }).order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('amount', { ascending: false });
        break;
      case 'lowest':
        query = query.order('amount', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('expense_date', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;
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
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('expense_date', { ascending: true });

    if (startDate) query = query.gte('expense_date', startDate);
    if (endDate) query = query.lte('expense_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async update(id, userId, updates) {
    const allowed = ['amount', 'category', 'description', 'expense_date', 'payment_method', 'expense_type', 'notes'];
    const filtered = {};

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        if (key === 'amount') filtered.amount = Number(updates.amount);
        else if (key === 'expense_type') filtered.expense_type = updates.expense_type.toLowerCase();
        else filtered[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('expenses')
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
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}

export default ExpenseModel;
