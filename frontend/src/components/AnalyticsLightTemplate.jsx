import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const AnalyticsLightTemplate = ({ analytics, currency, selectedRange }) => {
  const remainingBudget = Math.max(0, analytics.totalIncome - analytics.totalSpending);

  return (
    <div className="bg-transparent font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient">
          Analytics Overview
        </h1>
        <div className="flex space-x-2">
          <button className="btn-secondary px-5 py-2 shadow-sm font-bold transition-all text-sm group">
            <span className="flex items-center gap-2">Export Data</span>
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 hover:border-brand-500/30 hover:shadow-glow-brand transition-all duration-500">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider uppercase">
              Period Expenses
            </h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(analytics.totalSpending, currency)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-glow-emerald transition-all duration-500">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider uppercase">
              Remaining Flow
            </h3>
            <span className="bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Healthy
            </span>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(remainingBudget, currency)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 hover:border-purple-500/30 hover:shadow-glow-brand transition-all duration-500">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider uppercase">
              Daily Average
            </h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(analytics.averageDailySpending, currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Area */}
        <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-glass">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6">
            Spending Frequency
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.dayOfWeekDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 10px 25px -3px rgba(0,0,0,0.1)',
                    fontWeight: 'bold'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorAmt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spends */}
        <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-white/5 shadow-glass">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6">
            Top Highlights
          </h3>
          <ul className="space-y-6">
            {analytics.highestSingleExpense && (
              <li className="flex justify-between items-center group p-3 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                    🛒
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      Highest Purchase
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {analytics.highestSingleExpense.description}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {formatCurrency(analytics.highestSingleExpense.amount, currency)}
                </p>
              </li>
            )}
            {analytics.highestSpendingCategory && (
              <li className="flex justify-between items-center group p-3 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Top Category</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {analytics.highestSpendingCategory.category}
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {formatCurrency(analytics.highestSpendingCategory.amount, currency)}
                </p>
              </li>
            )}
            {analytics.mostExpensiveDay && (
              <li className="flex justify-between items-center group p-3 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
                    📅
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">Peak Day</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      Highest daily outflow
                    </p>
                  </div>
                </div>
                <p className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {formatCurrency(analytics.mostExpensiveDay.amount, currency)}
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
