import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { dashboardService } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import HealthScoreCard from '../components/HealthScoreCard.jsx';
import CategoryChart from '../components/CategoryChart.jsx';
import ExpenseChart from '../components/ExpenseChart.jsx';
import SpendingTrend from '../components/SpendingTrend.jsx';
import NeedsWantsChart from '../components/NeedsWantsChart.jsx';
import BudgetCard from '../components/BudgetCard.jsx';
import ExpenseCard from '../components/ExpenseCard.jsx';
import { StatCardSkeleton, ChartSkeleton } from '../components/SkeletonLoader.jsx';
import formatCurrency from '../utils/formatCurrency.js';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  PlusCircle,
  Plus,
  Target,
  PieChart as PieIcon,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getDashboard();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currency = user?.currency || 'INR';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center card-premium bg-white">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Something went wrong</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary mt-4 py-2 px-4 text-xs">
          Try Again
        </button>
      </div>
    );
  }

  const topRecommendation = data?.recommendations && data.recommendations.length > 0
    ? data.recommendations[0]
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's your real-time money overview and spending habits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/expenses/add"
            className="btn-primary flex items-center gap-1.5 py-2 px-3.5 text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
          <Link
            to="/income"
            className="btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </Link>
        </div>
      </div>

      {/* Smart Personalized Recommendation Hero Banner */}
      {topRecommendation && (
        <div className="card-premium p-4 sm:p-5 bg-gradient-to-r from-brand-50/90 via-indigo-50/70 to-purple-50/50 border border-brand-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl p-2 rounded-xl bg-white shadow-sm border border-brand-100">
              {topRecommendation.icon || '💡'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">{topRecommendation.title}</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand-100 text-brand-800">
                  Smart Suggestion
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {topRecommendation.message}
              </p>
            </div>
          </div>

          <Link
            to="/recommendations"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1 whitespace-nowrap self-end sm:self-center"
          >
            <span>View All Insights ({data?.recommendations?.length || 0})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={data?.balance || 0}
          subtitle="Remaining across all recorded income"
          icon={Wallet}
          variant="brand"
          currency={currency}
        />
        <StatCard
          title="Total Income"
          amount={data?.income || 0}
          subtitle="Allowance, gifts & earnings"
          icon={ArrowDownLeft}
          variant="success"
          currency={currency}
        />
        <StatCard
          title="Total Expenses"
          amount={data?.expenses || 0}
          subtitle="All-time recorded spending"
          icon={ArrowUpRight}
          variant="danger"
          currency={currency}
        />
        <StatCard
          title="This Month"
          amount={data?.thisMonthSpending || 0}
          subtitle={
            data?.thisMonthIncome > 0
              ? `Savings rate: ${data?.savingsRate || 0}%`
              : 'Monthly recorded expenditure'
          }
          icon={Calendar}
          variant="warning"
          currency={currency}
        />
      </div>

      {/* Charts & Health Score Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Health Score Card */}
        <div className="lg:col-span-1">
          <HealthScoreCard healthScore={data?.healthScore} />
        </div>

        {/* Expense by Category (Donut Chart) */}
        <div className="card-premium p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
              <p className="text-xs text-slate-500">Distribution of where your money went this month</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Details
            </Link>
          </div>
          <CategoryChart data={data?.expenseByCategory || []} currency={currency} />
        </div>
      </div>

      {/* Spending Trend & Needs vs Wants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Spending Trend (Line Chart) */}
        <div className="card-premium p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Spending Trend (Last 30 Days)</h3>
              <p className="text-xs text-slate-500">Daily expenses over time</p>
            </div>
          </div>
          <SpendingTrend data={data?.spendingTrend || []} currency={currency} />
        </div>

        {/* Needs vs Wants Donut Chart */}
        <div className="card-premium p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Needs vs Wants</h3>
            <p className="text-xs text-slate-500 mb-2">Target: 60% Needs, 40% Wants or lower</p>
          </div>
          <NeedsWantsChart needsVsWants={data?.needsVsWants} currency={currency} />
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            {data?.needsVsWants?.wantsPercentage > 50
              ? '💡 Consider cutting discretionary wants next week.'
              : '🌟 Great job keeping essentials prioritized!'}
          </div>
        </div>
      </div>

      {/* Monthly Spending Bar Chart Comparison */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Spending & Income Comparison</h3>
            <p className="text-xs text-slate-500">Compare earnings and outflows over the last 6 months</p>
          </div>
          <Link to="/analytics" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View Analytics
          </Link>
        </div>
        <ExpenseChart data={data?.monthlyExpenses || []} currency={currency} />
      </div>

      {/* Active Budgets & Recent Transactions Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category Budgets</h3>
              <p className="text-xs text-slate-500">Live limits for this month</p>
            </div>
            <Link to="/budget" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage Budgets
            </Link>
          </div>

          {data?.budgets && data.budgets.length > 0 ? (
            <div className="space-y-3">
              {data.budgets.slice(0, 3).map((budget) => (
                <BudgetCard key={budget.id} budget={budget} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center card-premium bg-white border-dashed border-2 border-slate-200">
              <p className="text-xs text-slate-500">No category budgets set for this month yet.</p>
              <Link to="/budget" className="btn-primary mt-3 py-2 px-3 text-xs inline-flex">
                + Set a Budget
              </Link>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest recorded spending & income</p>
            </div>
            <Link to="/expenses" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>

          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-2.5">
              {data.recentTransactions.map((tx) => (
                <div
                  key={`${tx.type}-${tx.id}`}
                  className="card-premium p-3.5 flex items-center justify-between card-hoverable"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      }`}
                    >
                      {tx.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{tx.description}</p>
                      <p className="text-[11px] text-slate-500">
                        {tx.category} • {tx.date} • {tx.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center card-premium bg-white border-dashed border-2 border-slate-200">
              <p className="text-xs text-slate-500">No transactions recorded yet.</p>
              <Link to="/expenses/add" className="btn-primary mt-3 py-2 px-3 text-xs inline-flex">
                + Add First Expense
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
