import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';

export const StatCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'brand', // 'brand', 'success', 'warning', 'danger'
  currency = 'INR'
}) => {
  const variantStyles = {
    brand: {
      bg: 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400',
      border: 'border-brand-100 dark:border-brand-900/60',
      amountColor: 'text-slate-900 dark:text-white'
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/60',
      amountColor: 'text-emerald-600 dark:text-emerald-400'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/60',
      amountColor: 'text-amber-600 dark:text-amber-400'
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/60',
      amountColor: 'text-rose-600 dark:text-rose-400'
    }
  };

  const style = variantStyles[variant] || variantStyles.brand;

  return (
    <div className="card-premium p-5 flex flex-col justify-between card-hoverable group relative overflow-hidden">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 ${style.bg} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}
      ></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${style.amountColor}`}>
            {formatCurrency(amount, currency)}
          </h3>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 relative z-10">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
