import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { budgetService, expenseService } from '../services/api.js';
import BudgetCard from '../components/BudgetCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import formatCurrency from '../utils/formatCurrency.js';
import { getTodayISO } from '../utils/dateUtils.js';
import {
  CORE_CATEGORIES,
  POPULAR_ITEMS,
  PAYMENT_METHODS
} from '../utils/categories.js';
import {
  PieChart as PieIcon,
  PlusCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Layers
} from 'lucide-react';

export const Budget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'items', 'categories'

  // Modal state for Budget Creation / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Form states for Budget
  const [budgetType, setBudgetType] = useState('item'); // 'item' or 'category'
  const [formCategory, setFormCategory] = useState(CORE_CATEGORIES[0]);
  const [customItemName, setCustomItemName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Quick Log Expense Modal state
  const [quickLogTarget, setQuickLogTarget] = useState(null);
  const [quickLogAmount, setQuickLogAmount] = useState('');
  const [quickLogDesc, setQuickLogDesc] = useState('');
  const [quickLogPaymentMethod, setQuickLogPaymentMethod] = useState('UPI');
  const [quickLogDate, setQuickLogDate] = useState(getTodayISO());
  const [quickLogSubmitting, setQuickLogSubmitting] = useState(false);
  const [quickLogError, setQuickLogError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currency = user?.currency || 'INR';

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await budgetService.getBudgets({ month: currentMonth, year: currentYear });
      if (res.data?.success) {
        setBudgets(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
      setError('Could not load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const exceededCount = budgets.filter((b) => b.isExceeded).length;

  // Filter budgets based on active tab
  const filteredBudgets = budgets.filter((b) => {
    const isCategory = CORE_CATEGORIES.includes(b.category);
    if (activeTab === 'items') return !isCategory;
    if (activeTab === 'categories') return isCategory;
    return true;
  });

  const handleOpenModal = (budgetToEdit = null) => {
    setFormError('');
    if (budgetToEdit) {
      setEditingBudget(budgetToEdit);
      const isCat = CORE_CATEGORIES.includes(budgetToEdit.category);
      if (isCat) {
        setBudgetType('category');
        setFormCategory(budgetToEdit.category);
        setCustomItemName('');
      } else {
        setBudgetType('item');
        setCustomItemName(budgetToEdit.category);
      }
      setFormAmount(budgetToEdit.amount);
    } else {
      setEditingBudget(null);
      setBudgetType('item');
      setCustomItemName('');
      setFormCategory(CORE_CATEGORIES[0]);
      setFormAmount('');
    }
    setIsModalOpen(true);
  };

  const handleApplyPopularItem = (item) => {
    setBudgetType('item');
    setCustomItemName(item.name);
    setFormAmount(item.defaultAmount.toString());
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError('');

    const targetCategory =
      budgetType === 'item' ? customItemName.trim() : formCategory;

    if (!targetCategory) {
      setFormError('Please enter a product or item name (e.g. Milk, Gym)');
      return;
    }

    if (!formAmount || Number(formAmount) <= 0) {
      setFormError('Please enter a budget amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, {
          category: targetCategory,
          amount: Number(formAmount),
          month: currentMonth,
          year: currentYear
        });
      } else {
        await budgetService.createBudget({
          category: targetCategory,
          amount: Number(formAmount),
          month: currentMonth,
          year: currentYear
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
      showToast(`Budget for "${targetCategory}" saved!`);
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to save budget'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      showToast(`Budget for ${budgetToDelete.category} deleted`);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget: ' + (err.response?.data?.message || err.message));
    }
  };

  // Quick Log Expense handlers
  const handleOpenQuickLog = (budget) => {
    setQuickLogTarget(budget);
    setQuickLogAmount('');
    setQuickLogDesc(`${budget.category} purchase`);
    setQuickLogDate(getTodayISO());
    setQuickLogPaymentMethod('UPI');
    setQuickLogError('');
  };

  const handleSaveQuickExpense = async (e) => {
    e.preventDefault();
    setQuickLogError('');

    if (!quickLogAmount || Number(quickLogAmount) <= 0) {
      setQuickLogError('Please enter a valid expense amount');
      return;
    }

    setQuickLogSubmitting(true);
    try {
      await expenseService.createExpense({
        amount: Number(quickLogAmount),
        category: quickLogTarget.category,
        description: quickLogDesc.trim() || `${quickLogTarget.category} expense`,
        expense_date: quickLogDate,
        payment_method: quickLogPaymentMethod,
        expense_type: 'need'
      });

      const updatedSpent = quickLogTarget.spent + Number(quickLogAmount);
      const remaining = Math.max(0, quickLogTarget.amount - updatedSpent);

      setQuickLogTarget(null);
      fetchBudgets();
      showToast(
        `Recorded ₹${Number(quickLogAmount).toLocaleString('en-IN')} on ${quickLogTarget.category}! (${formatCurrency(remaining, currency)} left)`
      );
    } catch (err) {
      setQuickLogError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to log expense'
      );
    } finally {
      setQuickLogSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-brand-600 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-brand-500 flex items-center gap-2.5 text-xs font-semibold animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Product & Category Budgets
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800">
              <Sparkles className="w-3 h-3" />
              Smart Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fix amounts for specific items (e.g. Milk ₹1,000, Gym ₹1,200) or categories for {monthNames[currentMonth - 1]} {currentYear}, then track actual expenses against them.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Fix Item / Category Amount</span>
        </button>
      </div>

      {/* Popular Quick-Start Item Badges */}
      <div className="card-premium p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Add Preset Products (Click to pre-fill)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ITEMS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                handleApplyPopularItem(item);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200/80 dark:border-slate-700 text-xs font-medium transition-all active:scale-95"
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                (₹{item.defaultAmount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Allocated
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalBudget, currency)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Across {budgets.length} fixed targets
          </p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Spent
          </p>
          <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalSpent, currency)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {totalBudget > 0
              ? `${Math.round((totalSpent / totalBudget) * 100)}% of allocation used`
              : '0%'}
          </p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Saved / Left
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalRemaining, currency)}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {exceededCount > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                ⚠️ {exceededCount} allocation exceeded
              </span>
            ) : (
              '✨ All allocations on track'
            )}
          </p>
        </div>
      </div>

      {/* Tab Filter & Budget Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({budgets.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'items'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Products / Items ({budgets.filter((b) => !CORE_CATEGORIES.includes(b.category)).length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categories ({budgets.filter((b) => CORE_CATEGORIES.includes(b.category)).length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Loading allocations...
          </div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="p-12 text-center card-premium border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {activeTab === 'items'
                ? 'No product items fixed yet'
                : 'No budgets created yet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Save fixed amounts for regular purchases like Milk (₹1,000) or Tea (₹500), then log what you actually spend to see your exact savings!
            </p>
            <button
              onClick={() => handleOpenModal(null)}
              className="btn-primary mt-4 py-2 px-4 text-xs inline-flex"
            >
              + Fix Your First Amount
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBudgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                currency={currency}
                onEdit={(budget) => handleOpenModal(budget)}
                onDelete={(budget) => setBudgetToDelete(budget)}
                onQuickLog={(budget) => handleOpenQuickLog(budget)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingBudget ? 'Edit Budget' : 'Fix Spending Limit'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pre-allocate money for an item or category
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {/* Type Switcher: Specific Item vs Category */}
              <div>
                <label className="label-field">Allocation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBudgetType('item')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      budgetType === 'item'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Specific Product / Item</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBudgetType('category')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      budgetType === 'category'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>General Category</span>
                  </button>
                </div>
              </div>

              {/* Target Name Field */}
              {budgetType === 'item' ? (
                <div>
                  <label className="label-field">
                    Product / Item Name (e.g. Milk, Gym, Novels)
                  </label>
                  <input
                    type="text"
                    required
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="e.g. Milk, Gym Membership, Internet"
                    className="input-field"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Milk', 'Tea/Chai', 'Gym', 'Metro Pass', 'Books'].map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => setCustomItemName(sugg)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        +{sugg}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label-field">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="input-field"
                  >
                    {CORE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="label-field">Monthly Fixed Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="1000"
                    className="input-field pl-8 text-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Budget applies to {monthNames[currentMonth - 1]} {currentYear}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Amount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Log Expense Modal */}
      {quickLogTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Log Expense for "{quickLogTarget.category}"
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allocated: ₹{quickLogTarget.amount?.toLocaleString('en-IN')} • Spent so far: ₹{quickLogTarget.spent?.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setQuickLogTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quickLogError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {quickLogError}
              </div>
            )}

            <form onSubmit={handleSaveQuickExpense} className="space-y-4">
              <div>
                <label className="label-field">Amount Spent</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    autoFocus
                    value={quickLogAmount}
                    onChange={(e) => setQuickLogAmount(e.target.value)}
                    placeholder="800"
                    className="input-field pl-8 text-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Description</label>
                <input
                  type="text"
                  required
                  value={quickLogDesc}
                  onChange={(e) => setQuickLogDesc(e.target.value)}
                  placeholder="e.g. Milk purchase, Gym monthly fee"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Payment Method</label>
                  <select
                    value={quickLogPaymentMethod}
                    onChange={(e) => setQuickLogPaymentMethod(e.target.value)}
                    className="input-field"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-field">Date</label>
                  <input
                    type="date"
                    required
                    value={quickLogDate}
                    onChange={(e) => setQuickLogDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setQuickLogTarget(null)}
                  disabled={quickLogSubmitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickLogSubmitting}
                  className="btn-primary"
                >
                  {quickLogSubmitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(budgetToDelete)}
        title="Delete Budget Allocation?"
        message={`Are you sure you want to remove the ₹${budgetToDelete?.amount?.toLocaleString('en-IN')} allocation for ${budgetToDelete?.category}?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBudgetToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default Budget;
