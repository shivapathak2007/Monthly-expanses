import { db } from '../config/db.js';

export class UserModel {
  static async findByEmail(email) {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
    }
    return data || null;
  }

  static async findById(id) {
    const { data, error } = await db
      .from('users')
      .select('id, name, email, age, monthly_income, currency, profile_picture, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by id:', error);
    }
    return data || null;
  }

  static async findByIdWithPassword(id) {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user with password:', error);
    }
    return data || null;
  }

  static async create({ name, email, password_hash, age, monthly_income = 0, currency = 'INR' }) {
    const { data, error } = await db
      .from('users')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        age: Number(age),
        monthly_income: Number(monthly_income) || 0,
        currency: currency || 'INR'
      })
      .select('id, name, email, age, monthly_income, currency, profile_picture, created_at')
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  static async update(id, updates) {
    const allowed = ['name', 'age', 'monthly_income', 'currency', 'profile_picture'];
    const filtered = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        filtered[key] = updates[key];
      }
    }

    const { data, error } = await db
      .from('users')
      .update(filtered)
      .eq('id', id)
      .select('id, name, email, age, monthly_income, currency, profile_picture, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePassword(id, password_hash) {
    const { data, error } = await db
      .from('users')
      .update({ password_hash })
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return true;
  }
}

export default UserModel;
