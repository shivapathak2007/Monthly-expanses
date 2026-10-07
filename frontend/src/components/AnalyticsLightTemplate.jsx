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
    <div className="bg-gray-50 text-gray-800 p-6 md:p-10 font-sans rounded-3xl overflow-hidden shadow-xl ring-1 ring-gray-200">
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <div className="flex space-x-2">
          <button className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-medium text-sm transition">
            Export
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium text-sm">Period Expenses</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(analytics.totalSpending, currency)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium text-sm">Remaining Flow</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
              Healthy
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(remainingBudget, currency)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 font-medium text-sm">Daily Average</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(analytics.averageDailySpending, currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending Frequency</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.dayOfWeekDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Highlights</h3>
          <ul className="space-y-6">
            {analytics.highestSingleExpense && (
              <li className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center text-blue-600 font-bold text-xl">
                    🛒
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Highest Purchase</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {analytics.highestSingleExpense.description}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900">
                  {formatCurrency(analytics.highestSingleExpense.amount, currency)}
                </p>
              </li>
            )}
            {analytics.highestSpendingCategory && (
              <li className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors flex items-center justify-center text-purple-600 font-bold text-xl">
                    ⚡
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Top Category</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {analytics.highestSpendingCategory.category}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900">
                  {formatCurrency(analytics.highestSpendingCategory.amount, currency)}
                </p>
              </li>
            )}
            {analytics.mostExpensiveDay && (
              <li className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center text-orange-600 font-bold text-xl">
                    📅
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Peak Day</p>
                    <p className="text-xs text-gray-500 mt-0.5">Highest daily outflow</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900">
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
