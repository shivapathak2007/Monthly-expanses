# ⚙️ SpendWise Backend REST API

Production-ready Node.js & Express.js REST API structured strictly with **Model-View-Controller (MVC)** architecture.

---

## 🏗️ Architecture Design

* **Controllers** (`src/controllers/`): Handle HTTP request lifecycle, parse query/body params, delegate to models/services, and return uniform JSON responses.
* **Models** (`src/models/`): Encapsulate all database queries with strict authenticated user scoping (`user_id`).
* **Services** (`src/services/`): Pure business logic:
  * `analyticsService.js`: Dynamic computation of totals, averages, 6-month trends, needs vs wants, and transparent spending health score.
  * `recommendationService.js`: Rule-based recommendation engine for teen budgeting habits.
* **Routes** (`src/routes/`): Declarative endpoint definitions with middleware pipelines.
* **Middleware** (`src/middleware/`):
  * `authMiddleware.js`: JWT token verification from Bearer headers and cookies.
  * `validationMiddleware.js`: Request body and query validation.
  * `errorMiddleware.js`: Centralized 404 and 500 error management without stack trace leakage in production.

---

## 📡 API Endpoints

### Authentication
* `POST /api/auth/register` — Register new user (hashing password with bcrypt 12 rounds)
* `POST /api/auth/login` — Login user and issue signed JWT
* `POST /api/auth/logout` — Clear session
* `GET /api/auth/me` — Retrieve current authenticated user

### Expenses
* `POST /api/expenses` — Create expense (Amount, Category, Description, Date, Method, Need/Want, Notes)
* `GET /api/expenses` — Search, filter, sort, and paginate expenses (`?page=1&limit=20&category=Food&search=pizza`)
* `GET /api/expenses/:id` — Get single expense
* `PUT /api/expenses/:id` — Update expense
* `DELETE /api/expenses/:id` — Delete expense

### Income & Pocket Money
* `POST /api/income` — Record income
* `GET /api/income` — List recorded income
* `PUT /api/income/:id` — Update income entry
* `DELETE /api/income/:id` — Delete income entry

### Budgets
* `POST /api/budgets` — Create/upsert category monthly budget
* `GET /api/budgets` — List budgets with live spent & remaining calculations
* `PUT /api/budgets/:id` — Update budget limit
* `DELETE /api/budgets/:id` — Remove budget

### Financial Goals
* `POST /api/goals` — Create savings target
* `GET /api/goals` — List goals with progress percentage
* `PUT /api/goals/:id` — Update goal / record savings contribution
* `DELETE /api/goals/:id` — Delete goal

### Dashboard & Analytics
* `GET /api/dashboard` — Optimized consolidated dashboard payload
* `GET /api/dashboard/analytics` — Advanced metrics, daily/weekly averages, peak spending days
* `GET /api/dashboard/recommendations` — Personalized spending recommendations

### User Profile
* `GET /api/users/profile` — Fetch user details
* `PUT /api/users/profile` — Update name, age, pocket money, currency
* `PUT /api/users/change-password` — Change password with bcrypt verification

---

## 💻 Running the Backend Locally

```bash
cd backend
npm install
npm run dev
```

Server starts on port **5001** (or custom `PORT` in `.env`).
To populate seed data:
```bash
npm run seed
```
To run tests:
```bash
npm test
```
