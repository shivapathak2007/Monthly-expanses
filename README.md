# 💰 Kharcha — Personal Expense Tracker & Smart Money Management

> **"Understand your spending. Plan with confidence. Build your financial future."**

**Kharcha** is a modern, production-grade personal finance web application built for everyone — working professionals, freelancers, students, parents, and business owners. It delivers comprehensive money management through real-time expense tracking, item & category budgets, visual analytics, data-driven financial suggestions, bulk data management, real Excel (.xlsx) exports, and multi-account switching.

---

## 🌟 Key Features

### 1. Universal Personal Finance Tracking
* **General-Purpose Architecture**: Designed for any individual or household — from monthly salary earners to college students and freelancers.
* **Real-time Overview**: Live tracking of total balance, recorded income, expenditures, and net monthly savings rate.
* **Needs vs Wants Breakdown**: Categorizes expenditures into essentials ("Needs") and discretionary lifestyle ("Wants") to maintain healthy budgeting ratios.
* **Product & Item Budgets**: Pre-fix spending allocations for specific items (e.g., Milk ₹1,000 budget vs ₹800 actual spent) as well as broad categories.

### 2. Multi-Select & Bulk Transaction Deletion
* **Select Mode**: Easily toggle selection mode on the Expenses and Income pages.
* **Multi-Select Checkboxes**: Select individual rows, multiple transactions, or all visible transactions in one click.
* **Bulk Action Toolbar**: Floating action bar showing `Selected: X` with instant `[Delete Selected]` and `[Cancel Selection]`.
* **Authorized Backend Deletion**: Secure bulk deletion endpoint (`DELETE WHERE id IN (...) AND user_id = authenticatedUserId`), guaranteeing strict per-user authorization.

### 3. Dedicated Suggestions & Guide Section (`/suggestions`)
* **No Intrusive Popups**: Annoying modal interruptions are eliminated; valuable insights are organized into a clean, dedicated hub.
* **Data-Driven Insights**: Personalized coaching alerts based on your real recorded transactions (high category spending alerts, budget warnings, overspending alerts, and savings celebrations).
* **10-Step "How to Use Kharcha" Guide**: Beginner-friendly walkthrough covering expense logging, income recording, budget creation, chart reading, Excel exporting, account switching, and account management.
* **Timeless Money Principles**: Practical financial disciplines including the 24-Hour Impulse Rule, emergency fund planning, and regular subscription audits.

### 4. Professional Excel (.xlsx) Export & In-App Preview
* **Real Excel Workbooks**: Uses `ExcelJS` on the backend to generate authentic binary `.xlsx` files with professional formatting, frozen headers, currency formatting (`₹`), and auto-filters.
* **5 Structured Sheets**:
  1. `Summary` — Account overview, total income, total expenses, savings rate, and transaction counts.
  2. `Expenses` — Full transaction ledger with dates, descriptions, categories, payment methods, and notes.
  3. `Income` — Chronological log of salaries, freelance earnings, investments, and inflows.
  4. `Budgets` — Category allocations, spent amounts, remaining buffers, and percentage utilized.
  5. `Goals` — Financial targets, target dates, current contributions, and percentage achieved.
* **In-App Spreadsheet Preview**: Inspect your exported financial data in a full interactive spreadsheet table inside Kharcha before or after downloading.

### 5. Multi-Account Support (Instagram-Style Switcher)
* **Multiple Accounts on One Device**: Switch effortlessly between personal, business, or family accounts without repeated logins.
* **Secure Session Architecture**: Stores cryptographically signed JWT sessions per account without ever storing plaintext passwords or password hashes.
* **Granular Session Control**: Provides "+ Add Account", "Switch to this Account", "Log out current account", and "Log out of all accounts".

### 6. Cloud Storage & Data Persistence
* **Cloud-First Persistence**: All financial data resides securely in cloud PostgreSQL infrastructure (Supabase) and persists permanently across sessions.
* **Logout Does Not Delete Data**: Signing out simply terminates your browser session; all transactions remain safe and load instantly upon signing back in.
* **Pluggable Storage Abstraction**: `storageService.js` provides a provider-based architecture supporting Supabase PostgreSQL as primary database, with built-in configuration for future expansion to Google Cloud Storage.

### 7. Permanent Account Deletion
* **Destructive Confirmation**: Requires typing `DELETE MY ACCOUNT` to prevent accidental loss.
* **Complete Cascading Purge**: Cascades deletion across expenses, income, budgets, goals, and user records strictly scoped by the authenticated user ID.
* **Session Invalidation**: Clears all local account states, invalidates auth tokens, and redirects cleanly.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Recharts, Lucide React, Tailwind CSS |
| **Backend** | Node.js, Express.js (ES Modules), MVC Architecture, ExcelJS, Helmet, CORS |
| **Database** | PostgreSQL via Supabase (with automatic resilient local SQLite development engine) |
| **Storage Layer** | `StorageService` provider abstraction (Supabase + optional Google Cloud Storage) |
| **Security** | Bcryptjs (12 salt rounds), JSON Web Tokens (JWT), strict user scoping, Supabase RLS |

---

## 📁 Project Architecture & Folder Structure

Kharcha maintains clean separation of concerns across `frontend/` and `backend/`:

```text
Kharcha/
│
├── frontend/                     # React + Vite Web Client
│   ├── src/
│   │   ├── components/           # Navbar (with Account Switcher), Sidebar, ExpenseCard, BudgetCard
│   │   ├── pages/                # Dashboard, Expenses, Income, Budget, SuggestionsGuide, Settings
│   │   ├── context/              # AuthContext (Multi-account state), ThemeContext (Dark mode)
│   │   ├── services/             # Axios API service layer (expenses, income, export, accounts)
│   │   ├── utils/                # Currency formatters, categories, date helpers
│   │   └── App.jsx               # Routes configuration
│   ├── .env.example
│   └── package.json
│
├── backend/                      # Express.js REST API (MVC)
│   ├── src/
│   │   ├── config/               # db.js (Supabase & SQLite adapter), env.js
│   │   ├── controllers/          # expenseController, incomeController, exportController, userController
│   │   ├── models/               # UserModel, ExpenseModel, IncomeModel, BudgetModel, GoalModel
│   │   ├── routes/               # expenseRoutes, incomeRoutes, exportRoutes, userRoutes, dashboardRoutes
│   │   ├── middleware/           # authMiddleware (JWT protect), validationMiddleware, errorMiddleware
│   │   ├── services/             # exportService (ExcelJS), storageService (Cloud Storage), analyticsService
│   │   ├── utils/                # passwordUtils, validators, seed.js
│   │   ├── app.js                # Express app setup and route mounting
│   │   └── server.js             # Server startup and graceful shutdown
│   ├── database/
│   │   └── schema.sql            # Supabase PostgreSQL schema with RLS & indexes
│   ├── tests/                    # Automated backend API tests (node:test + supertest)
│   ├── .env.example
│   └── package.json
│
├── package.json                  # Root runner script (concurrently)
└── README.md                     # Project documentation
```

---

## 🔒 Security Model

1. **Strict User Scoping**: The server never trusts client-supplied user IDs (`req.body.userId` or `req.query.userId`). Every database query enforces `WHERE user_id = req.user.id` extracted from verified JWT tokens.
2. **Bcrypt 12 Salt Rounds**: All user passwords are encrypted with 12 bcrypt salt rounds before reaching database storage.
3. **Multi-Account Credential Safety**: The Instagram-style account switcher stores only signed JWT tokens and non-sensitive profile identifiers (Name, Email). No passwords or password hashes are ever exposed to localStorage or frontend code.
4. **Supabase Row-Level Security (RLS)**: Core tables (`users`, `expenses`, `income`, `budgets`, `financial_goals`) have RLS policies enabled.
5. **Cross-Origin Protection**: Production CORS restricts API access strictly to trusted frontend origins with credential authorization.

---

## ⚡ Quickstart & Local Development

### Prerequisites
* Node.js v18+ and npm installed

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shivapathak2007/Monthly-expanses.git
cd Monthly-expanses

# Install all workspace dependencies
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/`:
```bash
cp backend/.env.example backend/.env
```

To connect to your **Supabase PostgreSQL** database:
```env
PORT=5001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
CLIENT_URL=http://localhost:5173
```
*(If `SUPABASE_URL` is omitted, Kharcha automatically runs in resilient local SQLite mode for offline development with zero setup!)*

### 3. Run Development Servers
```bash
# From root directory: runs both backend and frontend concurrently
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5001`
* **Health Check**: `http://localhost:5001/api/health`

### 4. Run Automated Backend Tests
```bash
npm run test:backend
```

---

## ☁️ Optional Google Cloud Storage Setup

Kharcha is designed with a pluggable storage layer (`storageService.js`). While Supabase / PostgreSQL handles all transactional financial data, large export archives or backup files can optionally be sent to Google Cloud Storage.

To enable Google Cloud Storage in the future, add the following to `backend/.env`:
```env
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-gcs-bucket-name
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}
```
If these variables are omitted, Kharcha operates seamlessly with its primary Supabase storage provider.

---

## 📄 License

MIT © 2026 Kharcha Team
