import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api.js';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PieChart,
  Download,
  Users,
  Trash2,
  AlertOctagon,
  TrendingDown,
  Info,
  Calendar,
  CreditCard
} from 'lucide-react';

export const SuggestionsGuide = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' | 'guide' | 'tips'

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getRecommendations();
      if (res.data?.success) {
        setRecommendations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setError('Could not generate personalized suggestions from your financial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'danger':
        return {
          bg: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/50',
          badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          badgeText: 'Alert'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50',
          badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          badgeText: 'Caution'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50',
          badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          badgeText: 'Win'
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-900/50',
          badge: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          badgeText: 'Smart Tip'
        };
    }
  };

  const guideSteps = [
    {
      num: 1,
      title: 'How to add an expense',
      desc: 'Click "+ Add Expense" from any page or the Dashboard. Fill in the amount, category, description, and whether the purchase was an essential "Need" or optional "Want".',
      link: '/expenses/add',
      linkText: 'Try Adding Expense'
    },
    {
      num: 2,
      title: 'How to add income',
      desc: 'Head over to "Income" in the sidebar and tap "+ Add Income". Record your salary, freelance earnings, allowance, or investments to keep your live balance accurate.',
      link: '/income',
      linkText: 'Go to Income'
    },
    {
      num: 3,
      title: 'How to create a budget',
      desc: 'Open "Budgets" to define monthly spending caps for individual categories (like Food, Shopping, Bills) or specific items. Kharcha alerts you when you cross 80% and 100%.',
      link: '/budget',
      linkText: 'Set a Budget'
    },
    {
      num: 4,
      title: 'How to track spending',
      desc: 'Visit the "Expenses" page to see every transaction in chronological order. Use live search, category filters, and date ranges to locate specific bills instantly.',
      link: '/expenses',
      linkText: 'View Expenses'
    },
    {
      num: 5,
      title: 'How to read charts',
      desc: 'In "Analytics" and on your Dashboard, look at the Category Donut to see where the bulk of your funds go, and inspect the 30-Day Trend to spot weekend spending spikes.',
      link: '/analytics',
      linkText: 'Open Analytics'
    },
    {
      num: 6,
      title: 'How to understand recommendations',
      desc: 'Kharcha automatically evaluates your actual spending against your income, category budgets, and Needs vs Wants ratio to generate personalized coaching tips.',
      link: '#',
      linkText: 'You are here!'
    },
    {
      num: 7,
      title: 'How to export data',
      desc: 'Go to "Settings" → "Export My Data" to preview and download a real multi-sheet Excel (.xlsx) file complete with summary stats, expenses, and budget sheets.',
      link: '/settings',
      linkText: 'Go to Settings'
    },
    {
      num: 8,
      title: 'How to switch accounts',
      desc: 'Click your profile avatar in the top-right navbar. You can add another Kharcha account, switch between them with one click, or log out cleanly.',
      link: '/profile',
      linkText: 'Manage Accounts'
    },
    {
      num: 9,
      title: 'How to delete transactions',
      desc: 'On the "Expenses" or "Income" page, use the red trash icon for single deletions, or click "Select Mode" to batch select multiple transactions and delete them all at once.',
      link: '/expenses',
      linkText: 'Check Expenses'
    },
    {
      num: 10,
      title: 'How to permanently delete your account',
      desc: 'Under "Settings" → "Delete Account", enter "DELETE MY ACCOUNT" to permanently purge your profile, expenses, income, budgets, and all associated cloud data.',
      link: '/settings',
      linkText: 'Security Settings'
    }
  ];

  const moneyPrinciples = [
    {
      icon: '📝',
      title: 'Track Every Single Expense',
      desc: 'Small daily outflows like ₹40 coffee or ₹100 auto rides quickly add up. Recording them daily builds mental awareness and eliminates end-of-month mystery deficits.'
    },
    {
      icon: '🔍',
      title: 'Review Spending Regularly',
      desc: 'Spend 5 minutes every Sunday checking your Kharcha Dashboard. Catching budget leaks early prevents stress in the final week of the month.'
    },
    {
      icon: '⚖️',
      title: 'Separate Needs from Wants',
      desc: 'Essentials (rent, groceries, basic transit) keep life running. Lifestyle upgrades (dining out, gadgets, gaming) are Wants. Aim for Needs to be at least 50-60% of outflows.'
    },
    {
      icon: '⏳',
      title: 'The 24-Hour Impulse Delay',
      desc: 'Before clicking buy on an unplanned online shopping cart or impulse item, wait 24 hours. Over 70% of impulse desires fade away by morning.'
    },
    {
      icon: '🎯',
      title: 'Set Realistic Budgets',
      desc: 'Avoid unrealistic extreme austerity that causes binge spending later. Start with achievable spending limits based on your actual past spending history.'
    },
    {
      icon: '🛡️',
      title: 'Maintain an Emergency Buffer',
      desc: 'Aim to build a liquid safety buffer of 1-3 months of essential living expenses. It protects you from medical unexpected bills or transit repairs without borrowing.'
    },
    {
      icon: '🔄',
      title: 'Audit Recurring Subscriptions',
      desc: 'Streaming services, cloud storage, gym memberships, and app tiers often bill silently. Audit your recurring list every quarter and cancel unused tools.'
    },
    {
      icon: '📈',
      title: 'Compare Month-over-Month',
      desc: 'Consistent progress matters more than perfection. Even saving 3-5% more this month compared to last month compounds into huge financial peace of mind.'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Suggestions & Money Guide
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized insights calculated from your real transactions, plus practical guides and budgeting principles.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'suggestions'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Insights ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            How to Use Kharcha
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tips'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Money Principles
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Educational Guidance:</span> Insights and tips are calculated dynamically from your actual recorded expenses and budgets. They are educational suggestions designed to build mindful financial discipline, not certified commercial investment advice.
        </p>
      </div>

      {/* TAB 1: Personalized Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Data-Driven Recommendations
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated live from your records
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-28 card-premium bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-28 card-premium bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-6 text-center card-premium text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 text-center card-premium border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Sparkles className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">All clear! No alerts right now</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                As you record more daily expenses, income, and budgets, Kharcha will surface smart coaching tips right here.
              </p>
            </div>
          ) : (
            recommendations.map((rec) => {
              const style = getSeverityStyle(rec.severity);
              return (
                <div
                  key={rec.id}
                  className={`card-premium p-5 border ${style.bg} transition-all duration-200 card-hoverable`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="text-3xl p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 shrink-0">
                        {rec.icon || '💡'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{rec.title}</h3>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${style.badge}`}>
                            {style.badgeText}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                          {rec.message}
                        </p>
                      </div>
                    </div>

                    {rec.actionLink && (
                      <Link
                        to={rec.actionLink}
                        className="btn-primary py-2 px-3 text-xs shrink-0 self-end sm:self-center inline-flex items-center gap-1.5"
                      >
                        <span>{rec.actionText || 'Take Action'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: How To Use Kharcha (10 Steps) */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              10-Step Getting Started Guide
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Everything you need to master Kharcha</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideSteps.map((step) => (
              <div
                key={step.num}
                className="card-premium p-5 flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {step.num}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                    {step.desc}
                  </p>
                </div>

                {step.link !== '#' && (
                  <div className="pl-8 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={step.link}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      <span>{step.linkText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Money Management Principles */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Timeless Personal Finance Principles
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Habits for lifelong stability</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moneyPrinciples.map((tip, idx) => (
              <div
                key={idx}
                className="card-premium p-5 flex items-start gap-3.5 card-hoverable"
              >
                <span className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                  {tip.icon}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsGuide;
