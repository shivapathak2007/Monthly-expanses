import React from 'react';
import { Activity, ShieldCheck, TrendingUp, CheckCircle, Info } from 'lucide-react';

export const HealthScoreCard = ({ healthScore }) => {
  if (!healthScore) return null;

  const { score, status, factors } = healthScore;

  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let gaugeColor = '#10B981';

  if (score < 55) {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
    gaugeColor = '#EF4444';
  } else if (score < 70) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    gaugeColor = '#F59E0B';
  }

  return (
    <div className="card-premium p-6 card-hoverable">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Spending Health Score</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          {status}
        </span>
      </div>

      {/* Main Score Display */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        <div className="relative flex items-center justify-center">
          {/* Circular SVG Progress */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="#F1F5F9"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke={gaugeColor}
              strokeWidth="9"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * score) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{score}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Transparent Factor Breakdown */}
        <div className="flex-1 w-full space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Budget Discipline</span>
              <span className="text-slate-900 font-bold">{factors?.budgetDiscipline}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-brand-600 h-1.5 rounded-full"
                style={{ width: `${factors?.budgetDiscipline}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Savings Habit</span>
              <span className="text-slate-900 font-bold">{factors?.savingsRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${factors?.savingsRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Needs vs Wants Balance</span>
              <span className="text-slate-900 font-bold">{factors?.needsVsWants}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${factors?.needsVsWants}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Spending Trend Stability</span>
              <span className="text-slate-900 font-bold">{factors?.spendingTrend}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${factors?.spendingTrend}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Transparent scoring based on budget limits, savings rate, and month-over-month trend.</span>
      </div>
    </div>
  );
};

export default HealthScoreCard;
