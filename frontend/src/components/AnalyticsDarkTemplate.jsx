import React from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const AnalyticsDarkTemplate = ({ analytics, currency, selectedRange }) => {
  const savingsRate =
    analytics.totalIncome > 0
      ? Math.max(
          0,
          Math.round(
            ((analytics.totalIncome - analytics.totalSpending) / analytics.totalIncome) * 100
          )
        )
      : 0;

  return (
    <div className="bg-transparent font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient drop-shadow-sm">
            Expense Analytics
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-1">
            Deep dive into your financial patterns
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary px-6 py-2.5 rounded-xl shadow-glow-brand font-bold transition-all text-sm group">
            <span className="flex items-center gap-2">
              Download Report{' '}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-brand-500/20 hover:border-brand-500/50 hover:shadow-glow-brand transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3 relative z-10">
            TOTAL SPENT
          </h3>
          <p className="text-3xl font-extrabold text-white relative z-10">
            {formatCurrency(analytics.totalSpending, currency)}
          </p>
          <span className="text-brand-400 text-xs font-semibold flex items-center mt-3 bg-brand-500/10 w-fit px-2.5 py-1 rounded-full relative z-10">
            Last {selectedRange} days
          </span>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-glow-emerald transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3 relative z-10">
            TOTAL INCOME
          </h3>
          <p className="text-3xl font-extrabold text-white relative z-10">
            {formatCurrency(analytics.totalIncome, currency)}
          </p>
          <span className="text-emerald-400 text-xs font-semibold flex items-center mt-3 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full relative z-10">
            Last {selectedRange} days
          </span>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 hover:shadow-glow-brand transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3 relative z-10">
            TOP CATEGORY
          </h3>
          <p className="text-2xl font-extrabold text-white truncate relative z-10">
            {analytics.highestSpendingCategory?.category || 'None'}
          </p>
          <span className="text-purple-400 text-xs font-semibold flex items-center mt-3 bg-purple-500/10 w-fit px-2.5 py-1 rounded-full relative z-10">
            {analytics.highestSpendingCategory
              ? formatCurrency(analytics.highestSpendingCategory.amount, currency)
              : ''}
          </span>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 hover:shadow-glow-brand transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3 relative z-10">
            SAVINGS RATE
          </h3>
          <p className="text-3xl font-extrabold text-white relative z-10">{savingsRate}%</p>
          <span className="text-blue-400 text-xs font-semibold flex items-center mt-3 bg-blue-500/10 w-fit px-2.5 py-1 rounded-full relative z-10">
            Estimated capability
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all shadow-glass">
          <h3 className="text-lg font-bold mb-6 text-white tracking-tight">
            Daily Average over Week
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.dayOfWeekDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff"
                  strokeOpacity={0.05}
                />
                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  stroke="#94A3B8"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  cursor={{ fill: '#ffffff', opacity: 0.05 }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all shadow-glass">
          <h3 className="text-lg font-bold mb-6 text-white tracking-tight">Payment Methods</h3>
          <div className="h-72 w-full flex flex-col justify-center gap-6">
            {analytics.paymentMethodDistribution.map((pm) => (
              <div key={pm.method} className="group">
                <div className="flex justify-between text-sm mb-2 font-bold text-slate-300 group-hover:text-white transition-colors">
                  <span>{pm.method}</span>
                  <span className="text-brand-400">{pm.percentage}%</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-purple-500 h-full rounded-full transition-all duration-1000 shadow-glow-brand"
                    style={{ width: `${pm.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
