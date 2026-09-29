import React from 'react';

export const StatCardSkeleton = () => (
  <div className="card-premium p-5 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="w-20 h-3 bg-slate-200 rounded"></div>
        <div className="w-32 h-7 bg-slate-200 rounded"></div>
      </div>
      <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="mt-4 pt-3 border-t border-slate-100">
      <div className="w-28 h-3 bg-slate-200 rounded"></div>
    </div>
  </div>
);

export const ExpenseRowSkeleton = () => (
  <div className="card-premium p-4 animate-pulse flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 bg-slate-200 rounded-2xl"></div>
      <div className="space-y-2">
        <div className="w-36 h-4 bg-slate-200 rounded"></div>
        <div className="w-24 h-3 bg-slate-200 rounded"></div>
      </div>
    </div>
    <div className="w-20 h-5 bg-slate-200 rounded"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="card-premium p-6 animate-pulse space-y-4">
    <div className="w-36 h-4 bg-slate-200 rounded"></div>
    <div className="w-full h-56 bg-slate-100 rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-300 border-t-brand-600 rounded-full animate-spin"></div>
    </div>
  </div>
);

export default {
  StatCardSkeleton,
  ExpenseRowSkeleton,
  ChartSkeleton
};
