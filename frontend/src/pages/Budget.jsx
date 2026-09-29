import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { budgetService } from '../services/api.js';
import BudgetCard from '../components/BudgetCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import formatCurrency from '../utils/formatCurrency.js';
import {
  PieChart as PieIcon,
  PlusCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Education',
  'Bills',
  'Subscriptions',
  'Health',
  'Gaming',
  'Clothing',
  'Personal Care',
  'Other'
];

export const Budget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Form states
  const [formCategory, setFormCategory] = useState('Food');
  const [formAmount, setFormAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleOpenModal = (budgetToEdit = null) => {
    setFormError('');
    if (budgetToEdit) {
      setEditingBudget(budgetToEdit);
      setFormCategory(budgetToEdit.category);
      setFormAmount(budgetToEdit.amount);
    } else {
      setEditingBudget(null);
      setFormCategory('Food');
      setFormAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formAmount || Number(formAmount) <= 0) {
      setFormError('Please enter a budget amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget.id, {
          category: formCategory,
          amount: Number(formAmount),
          month: currentMonth,
          year: currentYear
        });
      } else {
        await budgetService.createBudget({
          category: formCategory,
          amount: Number(formAmount),
          month: currentMonth,
          year: currentYear
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      setBudgetToDelete(null);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget: ' + (err.response?.data?.message || err.message));
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Set spending limits for {monthNames[currentMonth - 1]} {currentYear} to control expenses.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Budget</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalBudget, currency)}</h3>
          <p className="text-[11px] text-slate-500 mt-2">Across {budgets.length} categories</p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(totalSpent, currency)}</h3>
          <p className="text-[11px] text-slate-500 mt-2">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% of total allocated` : '0%'}
          </p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Buffer</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalRemaining, currency)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">
            {exceededCount > 0 ? (
              <span className="text-red-600 font-semibold">{exceededCount} category exceeded</span>
            ) : (
              'All categories within limits'
            )}
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Active Category Budgets</h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading budgets...</div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 text-xs font-semibold">{error}</div>
        ) : budgets.length === 0 ? (
          <div className="p-12 text-center card-premium bg-white border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <PieIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No budgets set yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Setting budgets for Food, Travel, or Entertainment helps you prevent running out of money before month-end!
            </p>
            <button
              onClick={() => handleOpenModal(null)}
              className="btn-primary mt-4 py-2 px-4 text-xs inline-flex"
            >
              + Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                currency={currency}
                onEdit={(budget) => handleOpenModal(budget)}
                onDelete={(budget) => setBudgetToDelete(budget)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingBudget ? 'Edit Budget' : 'Set Category Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="label-field">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input-field"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">Monthly Budget Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="2000"
                    className="input-field pl-8 text-lg font-bold text-slate-900"
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
                  {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(budgetToDelete)}
        title="Delete Category Budget?"
        message={`Are you sure you want to remove the ₹${budgetToDelete?.amount?.toLocaleString('en-IN')} budget for ${budgetToDelete?.category}?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBudgetToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default Budget;
