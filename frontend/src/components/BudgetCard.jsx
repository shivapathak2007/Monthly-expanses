import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import { getCategoryIcon, CORE_CATEGORIES } from '../utils/categories.js';
import { AlertTriangle, Trash2, Edit2, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export const BudgetCard = ({
  budget,
  onEdit,
  onDelete,
  onQuickLog,
  currency = 'INR'
}) => {
  const isExceeded = budget.spent > budget.amount;
  const pct = Math.min(100, budget.percentageUsed || 0);
  const isCustomProduct = !CORE_CATEGORIES.includes(budget.category);
  const icon = getCategoryIcon(budget.category);

  // Determine progress bar color based on percentage
  let progressColor = 'bg-brand-600';
  if (isExceeded) progressColor = 'bg-rose-500';
  else if (budget.percentageUsed >= 85) progressColor = 'bg-amber-500';
  else if (budget.percentageUsed >= 50) progressColor = 'bg-indigo-500';
  else progressColor = 'bg-emerald-500';

  const savedAmount = Math.max(0, budget.amount - budget.spent);

  return (
    <div
      className={`card-premium p-5 card-hoverable flex flex-col justify-between transition-all ${
        isExceeded
          ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
          : 'border-slate-100 dark:border-slate-800/80'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {budget.category}
                </h4>
                {isCustomProduct ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    <Sparkles className="w-2.5 h-2.5" />
                    Product Item
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Category
                  </span>
                )}
                {isExceeded && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Exceeded
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Limit: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(budget.amount, currency)}</span>
              </p>
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(budget)}
                className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit allocation"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(budget)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete allocation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Amount Metrics Display */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700/60">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Spent so far
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(budget.spent, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {isExceeded ? 'Over limit' : 'Saved / Left'}
            </span>
            <span
              className={`text-sm font-bold ${
                isExceeded
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isExceeded
                ? `+${formatCurrency(budget.spent - budget.amount, currency)}`
                : formatCurrency(savedAmount, currency)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-medium mb-1.5">
            <span
              className={
                isExceeded
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }
            >
              {budget.percentageUsed}% of budget used
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {isExceeded ? '⚠️ Limit crossed' : `${formatCurrency(savedAmount, currency)} remaining`}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Quick Log Expense Button */}
      {onQuickLog && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Purchased {budget.category}?
          </span>
          <button
            type="button"
            onClick={() => onQuickLog(budget)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold text-xs rounded-xl border border-brand-200/60 dark:border-brand-800/60 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Expense</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
