import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { dashboardService } from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Flame,
  Award,
  CreditCard,
  PieChart,
  Activity,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

const TIME_RANGES = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 }
];

export const Analytics = () => {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currency = user?.currency || 'INR';

  const fetchAnalytics = async (days) => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getAnalytics({ days });
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load advanced analytics:', err);
      setError('Could not load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedRange);
  }, [selectedRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 card-premium bg-slate-100 animate-pulse" />
          <div className="h-28 card-premium bg-slate-100 animate-pulse" />
          <div className="h-28 card-premium bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center card-premium bg-white">
        <p className="text-xs text-rose-600 font-semibold">{error || 'No analytics data available'}</p>
        <button onClick={() => fetchAnalytics(selectedRange)} className="btn-primary mt-3 py-1.5 px-3 text-xs">
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalSpending,
    totalIncome,
    averageDailySpending,
    averageWeeklySpending,
    averageMonthlySpending,
    highestSpendingCategory,
    highestSingleExpense,
    mostExpensiveDay,
    dayOfWeekDistribution = [],
    paymentMethodDistribution = [],
    monthComparison
  } = analytics;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep dive into spending averages, patterns, peak expense days, and month-over-month comparisons.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="inline-flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl gap-1 self-start sm:self-auto">
          {TIME_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setSelectedRange(r.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === r.days
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month-over-Month Comparison Banner */}
      {monthComparison && (
        <div
          className={`card-premium p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
            monthComparison.isLower
              ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                monthComparison.isLower ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {monthComparison.isLower ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Month-Over-Month Comparison
                </span>
              </div>
              <h3 className="text-base font-bold mt-0.5">{monthComparison.summary}</h3>
              <p className="text-xs opacity-80 mt-0.5">
                Current month: {formatCurrency(monthComparison.currentMonthSpending, currency)} • Last month:{' '}
                {formatCurrency(monthComparison.previousMonthSpending, currency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Spending Averages Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Average</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(averageDailySpending, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Based on the last {selectedRange} days</p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weekly Average</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(averageWeeklySpending, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Expected 7-day run rate</p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Projection</p>
          <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(averageMonthlySpending, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">30-day projected outflow</p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Highest Category */}
        <div className="card-premium p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Top Category</p>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {highestSpendingCategory ? highestSpendingCategory.category : 'None yet'}
            </h4>
            {highestSpendingCategory && (
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                {formatCurrency(highestSpendingCategory.amount, currency)}
              </p>
            )}
          </div>
        </div>

        {/* Highest Single Expense */}
        <div className="card-premium p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Highest Single Expense</p>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
              {highestSingleExpense ? highestSingleExpense.description : 'None'}
            </h4>
            {highestSingleExpense && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-0.5">
                {formatCurrency(highestSingleExpense.amount, currency)} (
                {formatDateFriendly(highestSingleExpense.expense_date)})
              </p>
            )}
          </div>
        </div>

        {/* Most Expensive Day */}
        <div className="card-premium p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Peak Spending Day</p>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {mostExpensiveDay ? formatDateFriendly(mostExpensiveDay.date) : 'None'}
            </h4>
            {mostExpensiveDay && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                {formatCurrency(mostExpensiveDay.amount, currency)} spent
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Day of Week & Payment Methods Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week Bar Chart */}
        <div className="card-premium p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Spending by Day of Week</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Discover which days you spend the most</p>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(val) => val.substring(0, 3)}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, currency), 'Spent']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px', border: '1px solid #334155' }}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="card-premium p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Payment Method Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Cash vs UPI vs Debit/Credit Cards</p>

            <div className="space-y-3">
              {paymentMethodDistribution.map((pm) => (
                <div key={pm.method}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{pm.method}</span>
                    <span className="text-slate-900 dark:text-white">
                      {formatCurrency(pm.amount, currency)}{' '}
                      <span className="text-slate-400 dark:text-slate-500 font-normal">({pm.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pm.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Digital payments (UPI & Cards) allow automated tracking.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
