import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spendwise_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for session expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on unauthorized response (if not already on login/register)
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('spendwise_token');
        localStorage.removeItem('spendwise_user');
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH SERVICES ---
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

// --- EXPENSE SERVICES ---
export const expenseService = {
  getExpenses: (params) => api.get('/expenses', { params }),
  getExpenseById: (id) => api.get(`/expenses/${id}`),
  createExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`)
};

// --- INCOME SERVICES ---
export const incomeService = {
  getIncome: (params) => api.get('/income', { params }),
  getIncomeById: (id) => api.get(`/income/${id}`),
  createIncome: (data) => api.post('/income', data),
  updateIncome: (id, data) => api.put(`/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/income/${id}`)
};

// --- BUDGET SERVICES ---
export const budgetService = {
  getBudgets: (params) => api.get('/budgets', { params }),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`)
};

// --- FINANCIAL GOAL SERVICES ---
export const goalService = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};

// --- DASHBOARD & ANALYTICS SERVICES ---
export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
  getRecommendations: () => api.get('/dashboard/recommendations')
};

// --- USER & SETTINGS SERVICES ---
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data)
};

export default api;
