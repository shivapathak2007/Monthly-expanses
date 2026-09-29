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
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100',
      amountColor: 'text-slate-900'
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      amountColor: 'text-emerald-700'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      amountColor: 'text-amber-700'
    },
    danger: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      amountColor: 'text-rose-700'
    }
  };

  const style = variantStyles[variant] || variantStyles.brand;

  return (
    <div className="card-premium p-5 flex flex-col justify-between card-hoverable">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className={`text-2xl font-bold tracking-tight ${style.amountColor}`}>
            {formatCurrency(amount, currency)}
          </h3>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg} border ${style.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
