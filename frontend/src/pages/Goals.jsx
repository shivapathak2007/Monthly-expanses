import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { goalService } from '../services/api.js';
import GoalCard from '../components/GoalCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import formatCurrency from '../utils/formatCurrency.js';
import { Target, PlusCircle, Sparkles, CheckCircle2, X } from 'lucide-react';

export const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const currency = user?.currency || 'INR';

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await goalService.getGoals();
      if (res.data?.success) {
        setGoals(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Could not load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current_amount, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.target_amount, 0);
  const completedGoals = goals.filter((g) => g.isAchieved).length;

  const handleOpenModal = (goalToEdit = null) => {
    setFormError('');
    if (goalToEdit) {
      setEditingGoal(goalToEdit);
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.target_amount);
      setCurrentAmount(goalToEdit.current_amount);
      setDeadline(goalToEdit.deadline || '');
    } else {
      setEditingGoal(null);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a goal name');
      return;
    }

    if (!targetAmount || Number(targetAmount) <= 0) {
      setFormError('Please enter a target amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        await goalService.updateGoal(editingGoal.id, {
          name: name.trim(),
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount) || 0,
          deadline: deadline || null
        });
      } else {
        await goalService.createGoal({
          name: name.trim(),
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount) || 0,
          deadline: deadline || null
        });
      }
      setIsModalOpen(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (goal, amountToAdd) => {
    try {
      const newAmount = goal.current_amount + amountToAdd;
      await goalService.updateGoal(goal.id, {
        current_amount: newAmount
      });
      fetchGoals();
    } catch (err) {
      alert('Failed to update goal progress');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await goalService.deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Turn dreams into reality. Save for gadgets, college trips, or emergency buffers.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Saved for Goals</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalSaved, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">Active stash accumulated</p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase">Target Total</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalTarget, currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">Combined future goals</p>
        </div>

        <div className="card-premium p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase">Completed Goals</p>
          <h3 className="text-2xl font-bold text-brand-600 mt-1">
            {completedGoals} / {goals.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">Goals fully achieved</p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Your Goals</h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your goals...</div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 text-xs font-semibold">{error}</div>
        ) : goals.length === 0 ? (
          <div className="p-12 text-center card-premium bg-white border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No savings goals created yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Want a new pair of headphones, concert ticket, or emergency cushion? Create your first goal now!
            </p>
            <button
              onClick={() => handleOpenModal(null)}
              className="btn-primary mt-4 py-2 px-4 text-xs inline-flex"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                currency={currency}
                onContribute={handleContribute}
                onEdit={(goal) => handleOpenModal(goal)}
                onDelete={(goal) => setGoalToDelete(goal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="label-field">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony Headphones, Gaming PC, Goa Trip"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000"
                    className="input-field pl-8 text-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Already Saved</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="input-field pl-8 text-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(goalToDelete)}
        title="Delete Savings Goal?"
        message={`Are you sure you want to delete the goal "${goalToDelete?.name}"?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setGoalToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default Goals;
