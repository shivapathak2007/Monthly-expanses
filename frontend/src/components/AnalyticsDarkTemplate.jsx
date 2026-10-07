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
    <div className="bg-gray-900 text-white p-6 md:p-10 font-sans rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Expense Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track and analyze your spending patterns</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-lg font-medium transition-all text-sm">
            Download Report
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md hover:border-blue-500 transition-all shadow-xl">
          <h3 className="text-gray-400 text-sm font-semibold tracking-wide mb-2">TOTAL SPENT</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(analytics.totalSpending, currency)}
          </p>
          <span className="text-red-400 text-xs font-medium flex items-center mt-2">
            In last {selectedRange} days
          </span>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md hover:border-green-500 transition-all shadow-xl">
          <h3 className="text-gray-400 text-sm font-semibold tracking-wide mb-2">TOTAL INCOME</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(analytics.totalIncome, currency)}
          </p>
          <span className="text-green-400 text-xs font-medium flex items-center mt-2">
            In last {selectedRange} days
          </span>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md hover:border-purple-500 transition-all shadow-xl">
          <h3 className="text-gray-400 text-sm font-semibold tracking-wide mb-2">TOP CATEGORY</h3>
          <p className="text-2xl font-bold text-white truncate">
            {analytics.highestSpendingCategory?.category || 'None'}
          </p>
          <span className="text-gray-400 text-xs font-medium flex items-center mt-2">
            {analytics.highestSpendingCategory
              ? formatCurrency(analytics.highestSpendingCategory.amount, currency)
              : ''}
          </span>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md hover:border-blue-500 transition-all shadow-xl">
          <h3 className="text-gray-400 text-sm font-semibold tracking-wide mb-2">SAVINGS RATE</h3>
          <p className="text-3xl font-bold text-white">{savingsRate}%</p>
          <span className="text-green-400 text-xs font-medium flex items-center mt-2">
            Estimated capability
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Daily Average over Week</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.dayOfWeekDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="amount" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-md shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Payment Methods</h3>
          <div className="h-72 w-full flex flex-col justify-center gap-6">
            {analytics.paymentMethodDistribution.map((pm) => (
              <div key={pm.method}>
                <div className="flex justify-between text-sm mb-2 font-medium text-gray-300">
                  <span>{pm.method}</span>
                  <span className="text-white">{pm.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000"
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
