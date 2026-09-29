-- ====================================================================
-- Kharcha Database Schema
-- Target: Supabase / PostgreSQL
-- Description: Core tables, constraints, indexes and triggers for Kharcha
-- ====================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 10 AND age <= 100),
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_income >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    profile_picture TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. EXPENSES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL,
    expense_type VARCHAR(10) NOT NULL CHECK (expense_type IN ('need', 'want')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. INCOME TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source VARCHAR(50) NOT NULL,
    description VARCHAR(255) DEFAULT '',
    income_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. BUDGETS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_month_year UNIQUE (user_id, category, month, year)
);

-- --------------------------------------------------------------------
-- 5. FINANCIAL GOALS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    deadline DATE DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category);

CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_income_date ON income(income_date);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, income_date);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- --------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Note: In Kharcha backend MVC architecture, the server connects via 
-- SUPABASE_SERVICE_ROLE_KEY to bypass RLS safely, and all authorization is strictly 
-- validated in authMiddleware and controllers by authenticated user ID.
-- However, if direct client queries are ever enabled:
CREATE POLICY "Users can manage their own profile" 
    ON users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own expenses" 
    ON expenses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own income" 
    ON income FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets" 
    ON budgets FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" 
    ON financial_goals FOR ALL USING (auth.uid() = user_id);
