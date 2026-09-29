# 🪙 SpendWise — Teenager Expense Tracker & Smart Money Management

> **"Understand your money. Control your spending. Build your future."**

SpendWise is a full-stack, production-quality money management web application tailored specifically for teenagers, college students, and first-time budgeters. It helps young adults cultivate healthy financial habits through automated expense tracking, category budgets, savings goals, and personalized spending recommendations.

---

## 🚀 Key Features

* **Real-time Financial Overview**: Live tracking of total balance, monthly pocket money/income, recorded expenses, and savings rate.
* **Categorized Spending**: Tag expenses across 12 teenager-relevant categories (*Food, Travel, Gaming, Shopping, Subscriptions, Education, etc.*).
* **Needs vs Wants Tracking**: Distinguishes essential expenses from discretionary spending with instant percentage breakdowns.
* **Visual Graph Analytics**: Interactive Recharts Donut charts, 30-day timeline trend area charts, and 6-month comparative bar charts.
* **Monthly Category Budgets**: Visual progress meters with automated `⚠️ Budget exceeded` warnings and remaining buffer counters.
* **Transparent Spending Health Score**: A transparent, explainable 0–100 score evaluating budget discipline, savings rate, needs/wants ratio, and trend stability.
* **Smart Spending Recommendation Engine**: A rule-based coaching system analyzing actual spending patterns to deliver educational advice (e.g. high category alerts, the 24-hour impulse rule, positive reinforcement).
* **Savings Goals**: Set visual targets with deadlines (*Sony Headphones, Goa College Trip, Emergency Cushion*) with quick contribution tracking.
* **Expense Management**: Fast search, multi-criteria filtering (category, payment method, need/want, date range), sorting, and paginated records.
* **Data Privacy & Security**: Passwords hashed with **bcrypt (12 salt rounds)**, stateless **JWT authentication**, parameterized queries, and strict user scoping.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Recharts, Lucide React, Tailwind CSS |
| **Backend** | Node.js, Express.js (ES Modules), MVC Architecture, Helmet, CORS, Express Rate Limit |
| **Database** | PostgreSQL via Supabase (with automatic resilient local SQLite development fallback) |
| **Security** | Bcryptjs (12 rounds), JSON Web Tokens (JWT), HTTP-only cookies, Parameterized queries |

---

## 📁 Project Architecture & Folder Structure

SpendWise maintains strict separation of concerns with isolated `frontend/` and `backend/` folders:

```text
teen-expense-tracker/
│
├── frontend/                     # React + Vite Web Client
│   ├── src/
│   │   ├── components/           # Reusable UI cards, charts, forms, modals
│   │   ├── pages/                # Dashboard, Expenses, Budget, Analytics, Goals, Profile, Settings
│   │   ├── context/              # AuthContext (JWT & User state)
│   │   ├── services/             # Axios API service layer
│   │   ├── utils/                # Indian number formatting, date helpers
│   │   ├── App.jsx               # Client-side routing & protected routes
│   │   └── index.css             # Tailwind CSS design system tokens
│   ├── .env.example
│   └── package.json
│
├── backend/                      # Express.js REST API (MVC)
│   ├── src/
│   │   ├── config/               # db.js (Supabase & SQLite adapter), env.js
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── models/               # User-scoped database operations
│   │   ├── routes/               # API endpoint routing
│   │   ├── middleware/           # authMiddleware, validationMiddleware, errorMiddleware
│   │   ├── services/             # analyticsService, recommendationService
│   │   ├── utils/                # passwordUtils, generateToken, seed.js
│   │   ├── app.js                # Express app setup with middleware
│   │   └── server.js             # Server startup & graceful shutdown
│   ├── database/
│   │   └── schema.sql            # Supabase PostgreSQL schema with RLS & indexes
│   ├── tests/                    # Automated backend API tests (node:test + supertest)
│   ├── .env.example
│   └── package.json
│
├── package.json                  # Root runner script (concurrently)
└── README.md                     # Master documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js** v18+ (tested on v24)
* **npm** v9+

### 1. One-Command Setup
From the repository root directory:
```bash
# Install all root, backend, and frontend dependencies
npm run install:all
```

### 2. Populate Demo Data
Run the realistic database seed script to populate realistic teen expenses, allowances, budgets, and goals:
```bash
npm run seed:backend
```

This creates a demo account ready for immediate login:
* **Email:** `shiva@example.com`
* **Password:** `password123`

### 3. Launch Both Applications
```bash
# Concurrently starts backend on :5001 and frontend on :5173
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5001/api](http://localhost:5001/api)
* **Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🗄️ Supabase PostgreSQL Setup

SpendWise is configured to connect directly to **Supabase PostgreSQL**.

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase project dashboard, open the **SQL Editor**.
3. Copy and run the entire contents of [`backend/database/schema.sql`](file:///Users/shivapathak/Desktop/nxt/backend/database/schema.sql).
4. Go to **Project Settings** → **API**.
5. Copy your **Project URL** and **Service Role Key** (or Anon Key) and paste them into `backend/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
```

6. Restart the backend. SpendWise will automatically detect the credentials and connect to your live Supabase database!

> *Note: If `SUPABASE_URL` is left blank during local development, SpendWise will seamlessly utilize its built-in persistent local SQLite storage engine, allowing you to develop and test offline with zero configuration.*

---

## 🧪 Automated Testing

SpendWise includes automated test coverage for registration, authentication, authorization, expense CRUD, input validation, and analytics calculations.

```bash
# Run backend test suite
npm run test:backend
```

All 14 test suites run using Node.js's native test runner (`node:test`) and `supertest`.

---

## 🛡️ Security Features

* **No Plaintext Passwords**: Password hashing via `bcrypt` with 12 salt rounds.
* **Identity Scoping**: Every database query is strictly derived from the decoded JWT token (`req.user.id`). Client-supplied user IDs are never trusted.
* **Brute-Force Rate Limiting**: Authentication endpoints (`/register`, `/login`) are rate-limited via `express-rate-limit`.
* **Security Headers**: Powered by `helmet` with secure defaults.
* **CORS Protection**: Restricted to authorized frontend clients.
* **Sanitized Responses**: User models and controllers explicitly omit password hashes from all JSON payloads.

---

## 📄 License
MIT © 2026 SpendWise Team
