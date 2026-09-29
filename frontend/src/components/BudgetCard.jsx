import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import { AlertTriangle, Trash2, Edit2 } from 'lucide-react';

export const BudgetCard = ({ budget, onEdit, onDelete, currency = 'INR' }) => {
  const isExceeded = budget.spent > budget.amount;
  const pct = Math.min(100, budget.percentageUsed || 0);

  // Determine progress bar color based on percentage
  let progressColor = 'bg-brand-600';
  if (isExceeded) progressColor = 'bg-rose-600';
  else if (budget.percentageUsed >= 85) progressColor = 'bg-amber-500';
  else if (budget.percentageUsed >= 50) progressColor = 'bg-indigo-600';

  return (
    <div className={`card-premium p-5 card-hoverable ${isExceeded ? 'border-red-200 bg-red-50/20' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-800">{budget.category}</h4>
            {isExceeded && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle className="w-3 h-3" />
                Budget exceeded
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatCurrency(budget.spent, currency)} / {formatCurrency(budget.amount, currency)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Edit budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete budget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className={isExceeded ? 'text-red-600 font-bold' : 'text-slate-600'}>
            {budget.percentageUsed}% used
          </span>
          <span className="text-slate-500">
            {isExceeded
              ? `₹${(budget.spent - budget.amount).toLocaleString('en-IN')} over`
              : `${formatCurrency(budget.remaining, currency)} remaining`}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
