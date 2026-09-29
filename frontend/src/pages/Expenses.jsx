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
  X,
  CheckSquare,
  Square,
  Trash2
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

  // Single Delete modal state
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Bulk Selection States
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  // Bulk Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === expenses.length && expenses.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expenses.map((e) => e.id));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await expenseService.bulkDeleteExpenses(selectedIds);
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      setIsSelectMode(false);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete selected expenses: ' + (err.response?.data?.message || err.message));
    } finally {
      setBulkDeleting(false);
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

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className={`inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
              isSelectMode
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isSelectMode ? 'Exit Selection' : 'Select Mode'}</span>
          </button>

          <Link
            to="/expenses/add"
            className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Expense</span>
          </Link>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Toolbar */}
      {isSelectMode && (
        <div className="sticky top-20 z-20 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-brand-200 dark:border-brand-800 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
            >
              {selectedIds.length === expenses.length && expenses.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedIds.length === expenses.length && expenses.length > 0
                  ? 'Deselect All'
                  : `Select All Visible (${expenses.length})`}
              </span>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              Selected: {selectedIds.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={selectedIds.length === 0}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
              selectable={isSelectMode}
              selected={selectedIds.includes(expense.id)}
              onToggleSelect={handleToggleSelect}
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

      {/* Single Expense Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.description}"? This action cannot be undone.`}
        confirmText="Delete Expense"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setExpenseToDelete(null)}
        isDanger={true}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title="Delete Selected Expenses?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected transaction${selectedIds.length === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmText={bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Expenses`}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setShowBulkDeleteModal(false)}
        isDanger={true}
      />
    </div>
  );
};

export default Expenses;
