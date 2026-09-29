import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import { getCategoryIcon } from '../utils/categories.js';
import { Edit2, Trash2, Tag, CreditCard } from 'lucide-react';

export const ExpenseCard = ({ expense, onEdit, onDelete, currency = 'INR' }) => {
  const icon = getCategoryIcon(expense.category);

  return (
    <div className="card-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-hoverable">
      {/* Left: Icon & Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {expense.description}
            </h4>
            <span className={expense.expense_type === 'need' ? 'badge-need' : 'badge-want'}>
              {expense.expense_type === 'need' ? 'Need' : 'Want'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
              {expense.category}
            </span>
            <span>•</span>
            <span>{formatDateFriendly(expense.expense_date)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-400" />
              {expense.payment_method}
            </span>
          </div>

          {expense.notes && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic line-clamp-1">
              "{expense.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          -{formatCurrency(expense.amount, currency)}
        </span>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit expense"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
