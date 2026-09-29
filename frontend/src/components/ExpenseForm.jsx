import React, { useState } from 'react';
import { getTodayISO } from '../utils/dateUtils.js';
import { CORE_CATEGORIES, PAYMENT_METHODS, POPULAR_ITEMS } from '../utils/categories.js';
import { Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';

export const ExpenseForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Expense'
}) => {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [categoryType, setCategoryType] = useState(() => {
    if (!initialData?.category) return 'category';
    return CORE_CATEGORIES.includes(initialData.category) ? 'category' : 'custom';
  });
  const [category, setCategory] = useState(() => {
    if (!initialData?.category) return CORE_CATEGORIES[0];
    return CORE_CATEGORIES.includes(initialData.category) ? initialData.category : CORE_CATEGORIES[0];
  });
  const [customCategory, setCustomCategory] = useState(() => {
    if (initialData?.category && !CORE_CATEGORIES.includes(initialData.category)) {
      return initialData.category;
    }
    return '';
  });
  const [description, setDescription] = useState(initialData?.description || '');
  const [expenseDate, setExpenseDate] = useState(initialData?.expense_date || getTodayISO());
  const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || 'UPI');
  const [expenseType, setExpenseType] = useState(initialData?.expense_type || 'need');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const finalCategory = categoryType === 'custom' ? customCategory.trim() : category;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!finalCategory) {
      setError('Please provide a category or product item name');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description (e.g. Milk purchase, Books)');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        category: finalCategory,
        description: description.trim(),
        expense_date: expenseDate,
        payment_method: paymentMethod,
        expense_type: expenseType,
        notes: notes.trim()
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to save expense'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuickItem = (item) => {
    setCategoryType('custom');
    setCustomCategory(item.name);
    if (!description) {
      setDescription(`${item.name} purchase`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Amount Input with Currency Symbol */}
      <div>
        <label className="label-field">Amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
            ₹
          </span>
          <input
            type="number"
            step="1"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="input-field pl-8 text-xl font-bold text-slate-900 dark:text-white"
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
          placeholder="e.g. 1L Milk, College Books, Bus Pass, Coffee"
          className="input-field"
        />
      </div>

      {/* Category / Product Item Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label-field mb-0">Category / Product Name</label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setCategoryType('category')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                categoryType === 'category'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Presets
            </button>
            <button
              type="button"
              onClick={() => setCategoryType('custom')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                categoryType === 'custom'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Specific Product Item
            </button>
          </div>
        </div>

        {categoryType === 'category' ? (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {CORE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g. Milk, Gym, Tea, Books"
              className="input-field"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400">Quick product:</span>
              {POPULAR_ITEMS.slice(0, 5).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleSelectQuickItem(item)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {item.icon} {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Method & Date Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <label className="label-field">Expense Date</label>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="input-field"
          />
        </div>
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
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Need</span>
            <span className="text-[10px] opacity-75">(Essential / Must)</span>
          </button>

          <button
            type="button"
            onClick={() => setExpenseType('want')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
              expenseType === 'want'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <span>Want</span>
            <span className="text-[10px] opacity-75">(Fun / Lifestyle)</span>
          </button>
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
