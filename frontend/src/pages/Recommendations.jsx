import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api.js';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getRecommendations();
      if (res.data?.success) {
        setRecommendations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Could not generate smart recommendations');
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
          bg: 'bg-rose-50/70 border-rose-200/80',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          badgeText: 'Alert'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50/70 border-amber-200/80',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          badgeText: 'Caution'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50/70 border-emerald-200/80',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          badgeText: 'Win'
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50/50 border-indigo-200/60',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          badgeText: 'Smart Tip'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Recommendations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Personalized, actionable financial coaching generated directly from your actual recorded spending and budget data.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <span className="font-semibold text-slate-800">Educational Guidance:</span> SpendWise recommendations are calculated from your actual spending to help you cultivate healthy budgeting and saving habits. They do not constitute certified financial or investment advice.
        </p>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-32 card-premium bg-slate-100 animate-pulse" />
            <div className="h-32 card-premium bg-slate-100 animate-pulse" />
            <div className="h-32 card-premium bg-slate-100 animate-pulse" />
          </div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 text-xs font-semibold">{error}</div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center card-premium bg-white border-2 border-dashed border-slate-200">
            <Sparkles className="w-8 h-8 text-brand-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No suggestions right now</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              As you record more daily expenses and income, SpendWise will uncover smart tips here!
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
                    <span className="text-3xl p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200/60 shrink-0">
                      {rec.icon || '💡'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${style.badge}`}>
                          {style.badgeText}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
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

      {/* Teenager Golden Money Rules Box */}
      <div className="card-premium p-6 bg-white border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>🧠</span>
          <span>The 4 Golden Teenager Money Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>⏳</span> The 24-Hour Impulse Rule
            </h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              If an item is a "Want" (clothes, games, snacks), wait 24 hours. If you still crave it tomorrow, consider buying it. 70% of impulse desires vanish overnight!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🎯</span> The 50/30/20 Student Rule
            </h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              50% for college needs & meals, 30% for fun with friends, and 20% untouched into your savings or goals fund.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>📱</span> Track Micro-Transactions
            </h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              UPI payments make spending painless. Entering ₹40 tea or ₹100 autos builds mental awareness of outflows.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🛡️</span> Build a ₹2,000 Emergency Stash
            </h4>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Keep a small buffer for flat tires, forgotten notes, or emergency cab rides so you never have to scramble.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
