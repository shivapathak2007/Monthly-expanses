import React, { useState } from 'react';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import { Target, CheckCircle2, Plus, Trash2, Edit2 } from 'lucide-react';

export const GoalCard = ({ goal, onContribute, onEdit, onDelete, currency = 'INR' }) => {
  const [addingMoney, setAddingMoney] = useState(false);
  const [contribution, setContribution] = useState('');

  const pct = Math.min(100, goal.progressPercentage || 0);
  const isCompleted = goal.current_amount >= goal.target_amount;

  const handleAdd = (e) => {
    e.preventDefault();
    if (Number(contribution) > 0 && onContribute) {
      onContribute(goal, Number(contribution));
      setContribution('');
      setAddingMoney(false);
    }
  };

  return (
    <div className={`card-premium p-5 card-hoverable ${isCompleted ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'}`}>
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{goal.name}</h4>
            {goal.deadline && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Target: {formatDateFriendly(goal.deadline)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Amounts */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="text-brand-700 dark:text-brand-400 font-bold">{goal.progressPercentage}% saved</span>
          <span className="text-slate-500 dark:text-slate-400">
            {formatCurrency(goal.current_amount, currency)} / {formatCurrency(goal.target_amount, currency)}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-brand-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>
            {isCompleted ? 'Goal Achieved! 🎉' : `${formatCurrency(goal.remaining, currency)} to go`}
          </span>

          {!isCompleted && !addingMoney && (
            <button
              onClick={() => setAddingMoney(true)}
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Money</span>
            </button>
          )}
        </div>

        {addingMoney && (
          <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="number"
              min="1"
              required
              autoFocus
              placeholder="Amount to save (₹)"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="input-field py-1.5 text-xs"
            />
            <button type="submit" className="btn-primary py-1.5 px-3 text-xs shrink-0">
              Save
            </button>
            <button
              type="button"
              onClick={() => setAddingMoney(false)}
              className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
