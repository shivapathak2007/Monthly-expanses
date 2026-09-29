import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { expenseService } from '../services/api.js';
import ExpenseCard from '../components/ExpenseCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { ExpenseRowSkeleton } from '../components/SkeletonLoader.jsx';
import { CORE_CATEGORIES, PAYMENT_METHODS } from '../utils/categories.js';
import {
  Search,
  Filter,
  PlusCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Receipt,
  X
} from 'lucide-react';

export const Expenses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Delete modal state
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 15,
        sort: sortBy
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (expenseType) params.expense_type = expenseType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await expenseService.getExpenses(params);
      if (res.data?.success) {
        setExpenses(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Could not load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, category, paymentMethod, expenseType, sortBy, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExpenses();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setPaymentMethod('');
    setExpenseType('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense: ' + (err.response?.data?.message || err.message));
    }
  };

  const hasActiveFilters = Boolean(
    category || paymentMethod || expenseType || startDate || endDate || search
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View, search, filter and manage every single penny spent.
          </p>
        </div>

        <Link
          to="/expenses/add"
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Expense</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-premium p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by description (e.g. Milk, pizza, books, Uber)..."
              className="input-field pl-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Filter toggle & Sort Selector */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-colors ${
                hasActiveFilters || showFilters
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-600" />
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field py-2.5 text-xs font-medium w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filter Tray */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="label-field text-[10px]">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-1.5 text-xs"
              >
                <option value="">All Categories</option>
                {CORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field text-[10px]">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-1.5 text-xs"
              >
                <option value="">All Payment Methods</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field text-[10px]">Need vs Want</label>
              <select
                value={expenseType}
                onChange={(e) => {
                  setExpenseType(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-1.5 text-xs"
              >
                <option value="">All Types</option>
                <option value="need">Need Only</option>
                <option value="want">Want Only</option>
              </select>
            </div>

            <div>
              <label className="label-field text-[10px]">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="label-field text-[10px]">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field py-1.5 text-xs"
              />
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 md:col-span-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset all filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <ExpenseRowSkeleton />
            <ExpenseRowSkeleton />
            <ExpenseRowSkeleton />
            <ExpenseRowSkeleton />
          </div>
        ) : error ? (
          <div className="p-8 text-center card-premium">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
            <button onClick={fetchExpenses} className="btn-primary mt-3 py-1.5 px-3 text-xs">
              Try Again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center card-premium border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No expenses found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your filters or search keywords.'
                : 'Start tracking your first expense and take control of your money.'}
            </p>
            <Link to="/expenses/add" className="btn-primary mt-4 py-2 px-4 text-xs inline-flex">
              + Add Expense
            </Link>
          </div>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currency={user?.currency || 'INR'}
              onEdit={(exp) => navigate(`/expenses/edit/${exp.id}`)}
              onDelete={(exp) => setExpenseToDelete(exp)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 card-premium text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete Expense"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setExpenseToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default Expenses;
