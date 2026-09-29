import React, { useState } from 'react';
import { getTodayISO } from '../utils/dateUtils.js';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

export const ExpenseForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Save Expense' }) => {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || 'Food');
  const [description, setDescription] = useState(initialData?.description || '');
  const [expenseDate, setExpenseDate] = useState(initialData?.expense_date || getTodayISO());
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || 'UPI');
  const [expenseType, setExpenseType] = useState(initialData?.expense_type || 'want');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description (e.g. Pizza with friends, Books)');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        category,
        description: description.trim(),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        expense_type: expenseType,
        notes: notes.trim()
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Amount Input with Currency Symbol */}
      <div>
        <label className="label-field">Amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
          <input
            type="number"
            step="1"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="input-field pl-8 text-lg font-bold text-slate-900"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label-field">Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Pizza with friends, Bus pass, Steam pass"
          className="input-field"
        />
      </div>

      {/* Category & Payment Method Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
          <label className="label-field">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="input-field"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date & Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Date</label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Need vs Want Selector */}
        <div>
          <label className="label-field">Type (Need vs Want)</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExpenseType('need')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                expenseType === 'need'
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Need</span>
              <span className="text-[10px] opacity-75">(Essential)</span>
            </button>

            <button
              type="button"
              onClick={() => setExpenseType('want')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                expenseType === 'want'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Want</span>
              <span className="text-[10px] opacity-75">(Fun/Wish)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes (Optional) */}
      <div>
        <label className="label-field">Notes (Optional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional thoughts or reminders..."
          className="input-field resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full sm:w-auto"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
