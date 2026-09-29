import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbClient = null;

if (env.isSupabaseConfigured()) {
  console.log('🔌 Connecting to live Supabase PostgreSQL at:', env.SUPABASE_URL);
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  dbClient = createClient(env.SUPABASE_URL, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.log('⚡ NOTICE: SUPABASE_URL is not configured yet in backend/.env.');
  console.log('💾 Running in resilient local SQLite mode with full Supabase API compatibility.');
  console.log('👉 To connect to your Supabase project, simply add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to backend/.env\n');

  // Ensure data folder exists
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'spendwise.sqlite');
  const sqlite = new Database(dbPath);

  // Initialize SQLite tables matching the Supabase schema
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      age INTEGER NOT NULL,
      monthly_income REAL NOT NULL DEFAULT 0.0,
      currency TEXT NOT NULL DEFAULT 'INR',
      profile_picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      expense_date TEXT NOT NULL DEFAULT (date('now')),
      payment_method TEXT NOT NULL,
      expense_type TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS income (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      source TEXT NOT NULL,
      description TEXT DEFAULT '',
      income_date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, category, month, year)
    );

    CREATE TABLE IF NOT EXISTS financial_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0.0,
      deadline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
    CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id, month, year);
    CREATE INDEX IF NOT EXISTS idx_goals_user ON financial_goals(user_id);
  `);

  // Supabase Query Builder mock for local SQLite
  class LocalQueryBuilder {
    constructor(tableName) {
      this.table = tableName;
      this.mode = 'select'; // 'select', 'insert', 'update', 'delete'
      this.selectFields = '*';
      this.conditions = []; // { col, op, val }
      this.insertData = null;
      this.updateData = null;
      this.orderCol = null;
      this.orderAsc = true;
      this.limitCount = null;
      this.offsetCount = null;
      this.isSingle = false;
      this.hasCount = false;
    }

    select(fields = '*', options = {}) {
      if (this.mode !== 'insert' && this.mode !== 'update') {
        this.mode = 'select';
      }
      this.selectFields = fields;
      if (options.count) {
        this.hasCount = true;
      }
      return this;
    }

    insert(data) {
      this.mode = 'insert';
      this.insertData = Array.isArray(data) ? data : [data];
      return this;
    }

    update(data) {
      this.mode = 'update';
      this.updateData = data;
      return this;
    }

    delete() {
      this.mode = 'delete';
      return this;
    }

    eq(column, value) {
      this.conditions.push({ col: column, op: '=', val: value });
      return this;
    }

    neq(column, value) {
      this.conditions.push({ col: column, op: '!=', val: value });
      return this;
    }

    gte(column, value) {
      this.conditions.push({ col: column, op: '>=', val: value });
      return this;
    }

    lte(column, value) {
      this.conditions.push({ col: column, op: '<=', val: value });
      return this;
    }

    ilike(column, pattern) {
      this.conditions.push({ col: column, op: 'LIKE', val: pattern });
      return this;
    }

    order(column, { ascending = true } = {}) {
      this.orderCol = column;
      this.orderAsc = ascending;
      return this;
    }

    range(from, to) {
      this.offsetCount = from;
      this.limitCount = to - from + 1;
      return this;
    }

    limit(count) {
      this.limitCount = count;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    async then(resolve, reject) {
      try {
        const result = this.execute();
        resolve(result);
      } catch (err) {
        resolve({ data: null, error: err, count: 0 });
      }
    }

    execute() {
      try {
        if (this.mode === 'insert') {
          const inserted = [];
          const now = new Date().toISOString();
          for (const row of this.insertData) {
            const dataToInsert = {
              id: row.id || uuidv4(),
              ...row,
              created_at: row.created_at || now,
              updated_at: row.updated_at || now
            };

            const keys = Object.keys(dataToInsert);
            const placeholders = keys.map(() => '?').join(', ');
            const values = Object.values(dataToInsert);

            const stmt = sqlite.prepare(`
              INSERT INTO ${this.table} (${keys.join(', ')})
              VALUES (${placeholders})
            `);
            stmt.run(...values);

            const fields = this.selectFields || '*';
            const fetchStmt = sqlite.prepare(`SELECT ${fields} FROM ${this.table} WHERE id = ?`);
            inserted.push(fetchStmt.get(dataToInsert.id));
          }

          return {
            data: this.isSingle ? (inserted[0] || null) : inserted,
            error: null
          };
        }

        if (this.mode === 'update') {
          const whereParts = [];
          const params = [];

          const updatedData = {
            ...this.updateData,
            updated_at: new Date().toISOString()
          };

          const setParts = [];
          for (const [key, val] of Object.entries(updatedData)) {
            setParts.push(`${key} = ?`);
            params.push(val);
          }

          for (const cond of this.conditions) {
            whereParts.push(`${cond.col} ${cond.op} ?`);
            params.push(cond.val);
          }

          const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
          
          // First find matching IDs to return updated rows
          const selectStmt = sqlite.prepare(`SELECT id FROM ${this.table} ${whereClause}`);
          const matchingIds = selectStmt.all(...this.conditions.map(c => c.val)).map(r => r.id);

          const updateStmt = sqlite.prepare(`UPDATE ${this.table} SET ${setParts.join(', ')} ${whereClause}`);
          updateStmt.run(...params);

          if (matchingIds.length === 0) {
            return { data: this.isSingle ? null : [], error: null };
          }

          const placeholders = matchingIds.map(() => '?').join(', ');
          const fetchUpdated = sqlite.prepare(`SELECT * FROM ${this.table} WHERE id IN (${placeholders})`);
          const rows = fetchUpdated.all(...matchingIds);

          return {
            data: this.isSingle ? (rows[0] || null) : rows,
            error: null
          };
        }

        if (this.mode === 'delete') {
          const whereParts = [];
          const params = [];
          for (const cond of this.conditions) {
            whereParts.push(`${cond.col} ${cond.op} ?`);
            params.push(cond.val);
          }
          const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
          const stmt = sqlite.prepare(`DELETE FROM ${this.table} ${whereClause}`);
          stmt.run(...params);
          return { data: null, error: null };
        }

        // SELECT query
        const whereParts = [];
        const params = [];
        for (const cond of this.conditions) {
          whereParts.push(`${cond.col} ${cond.op} ?`);
          params.push(cond.val);
        }
        const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

        let count = null;
        if (this.hasCount) {
          const countStmt = sqlite.prepare(`SELECT COUNT(*) as total FROM ${this.table} ${whereClause}`);
          count = countStmt.get(...params).total;
        }

        let orderClause = '';
        if (this.orderCol) {
          orderClause = `ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
        }

        let paginationClause = '';
        if (this.limitCount !== null) {
          paginationClause = `LIMIT ${this.limitCount}`;
          if (this.offsetCount !== null) {
            paginationClause += ` OFFSET ${this.offsetCount}`;
          }
        }

        const query = `SELECT ${this.selectFields} FROM ${this.table} ${whereClause} ${orderClause} ${paginationClause}`;
        const stmt = sqlite.prepare(query);
        const rows = stmt.all(...params);

        if (this.isSingle) {
          return {
            data: rows[0] || null,
            error: null,
            count
          };
        }

        return {
          data: rows,
          error: null,
          count
        };
      } catch (err) {
        return { data: null, error: err, count: 0 };
      }
    }
  }

  dbClient = {
    from: (tableName) => new LocalQueryBuilder(tableName)
  };
}

export const db = dbClient;
export default db;
