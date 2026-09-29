import React, { useState } from 'react';
import { getTodayISO } from '../utils/dateUtils.js';

const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Allowance',
  'Gift',
  'Other'
];

export const IncomeForm = ({ initialData, onSubmit, onCancel, submitLabel = 'Save Income' }) => {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [source, setSource] = useState(initialData?.source || 'Salary');
  const [description, setDescription] = useState(initialData?.description || '');
  const [incomeDate, setIncomeDate] = useState(initialData?.income_date || getTodayISO());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        amount: Number(amount),
        source,
        description: description.trim(),
        income_date: incomeDate
      });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to record income');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
          {error}
        </div>
      )}

      {/* Amount Input */}
      <div>
        <label className="label-field">Income Amount</label>
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
            className="input-field pl-8 text-xl font-bold text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Source */}
      <div>
        <label className="label-field">Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="input-field"
        >
          {INCOME_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="label-field">Date Received</label>
        <input
          type="date"
          required
          value={incomeDate}
          onChange={(e) => setIncomeDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Description */}
      <div>
        <label className="label-field">Description (Optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Monthly allowance, Birthday cash, Tutoring"
          className="input-field"
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

export default IncomeForm;
