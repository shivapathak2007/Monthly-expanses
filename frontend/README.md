# 🎨 SpendWise Frontend Web Application

Modern, responsive Single Page Application (SPA) built with **React 19**, **Vite**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Visual Aesthetics & Design System

* **Brand Colors**:
  * Primary: `#4F46E5` (Indigo-600)
  * Success: `#16A34A` (Green-600)
  * Warning: `#F59E0B` (Amber-500)
  * Danger: `#DC2626` (Red-600)
  * Background: `#F8FAFC` (Slate-50)
  * Cards: `#FFFFFF` with 16px radius and subtle drop shadows
* **Typography**: Clean, modern typography using Google Fonts **Outfit** and **Plus Jakarta Sans**.
* **Micro-Interactions**: Hover scales, animated progress meters, skeleton loading states, and custom tooltips.

---

## 🧭 Page Sitemap

* `/login` — Login screen with 1-click demo credentials autofill
* `/register` — Account registration with age, pocket money, and password checks
* `/dashboard` — Master financial overview with live stat cards, charts, and recommendations
* `/expenses` — Transaction explorer with search, multi-filters, sorting, and pagination
* `/expenses/add` — Quick expense entry with category picker, payment methods, and Need/Want tags
* `/expenses/edit/:id` — Edit existing expense details
* `/income` — Pocket money and earnings ledger
* `/budget` — Category spending limits with real-time progress bars and over-budget badges
* `/analytics` — Advanced spending analytics with time range selector (7d, 30d, 3m, 6m, 1y)
* `/recommendations` — Personalized financial coaching insights and educational rules
* `/goals` — Financial savings goals tracker with instant contribution modal
* `/profile` — Student profile and password change form
* `/settings` — Preferences, JSON transactions backup export, and security overview

---

## 💻 Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173).
To build for production:
```bash
npm run build
```
