import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { incomeService } from '../services/api.js';
import IncomeForm from '../components/IncomeForm.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import {
  BadgeDollarSign,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  X
} from 'lucide-react';

const SOURCE_ICONS = {
  'Pocket Money': '👨‍👩‍👧',
  Salary: '💼',
  Freelance: '💻',
  Gift: '🎁',
  Scholarship: '🎓',
  Other: '💵'
};

export const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [incomeToDelete, setIncomeToDelete] = useState(null);

  const currency = user?.currency || 'INR';

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await incomeService.getIncome();
      if (res.data?.success) {
        setIncomes(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load income:', err);
      setError('Could not load income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveIncome = async (formData) => {
    if (editingIncome) {
      await incomeService.updateIncome(editingIncome.id, formData);
    } else {
      await incomeService.createIncome(formData);
    }
    setIsModalOpen(false);
    setEditingIncome(null);
    fetchIncomes();
  };

  const handleDeleteConfirm = async () => {
    if (!incomeToDelete) return;
    try {
      await incomeService.deleteIncome(incomeToDelete.id);
      setIncomeToDelete(null);
      fetchIncomes();
    } catch (err) {
      alert('Failed to delete income: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Income & Pocket Money
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track allowances, freelance gigs, gifts and scholarships.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingIncome(null);
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="card-premium p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/15">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Total Recorded Income
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">
              {formatCurrency(totalIncome, currency)}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <BadgeDollarSign className="w-7 h-7" />
          </div>
        </div>
        <p className="text-xs text-emerald-100 mt-3 pt-3 border-t border-white/10">
          Showing all recorded income sources and deposits
        </p>
      </div>

      {/* Income Records List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Income History</h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading income entries...</div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 text-xs font-semibold">{error}</div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center card-premium bg-white border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <BadgeDollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No income recorded yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Add your monthly pocket money, stipend, or gift money to keep your balance accurate.
            </p>
            <button
              onClick={() => {
                setEditingIncome(null);
                setIsModalOpen(true);
              }}
              className="btn-primary mt-4 py-2 px-4 text-xs inline-flex"
            >
              + Record First Income
            </button>
          </div>
        ) : (
          incomes.map((inc) => (
            <div
              key={inc.id}
              className="card-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-hoverable"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                  {SOURCE_ICONS[inc.source] || '💰'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{inc.source}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>{formatDateFriendly(inc.income_date)}</span>
                    {inc.description && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600 italic">"{inc.description}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-base font-bold text-emerald-600 tracking-tight">
                  +{formatCurrency(inc.amount, currency)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingIncome(inc);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIncomeToDelete(inc)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingIncome ? 'Edit Income Entry' : 'Record New Income'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIncome(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <IncomeForm
              initialData={editingIncome}
              onSubmit={handleSaveIncome}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingIncome(null);
              }}
              submitLabel={editingIncome ? 'Update Income' : 'Save Income'}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(incomeToDelete)}
        title="Delete Income Record?"
        message={`Are you sure you want to delete the ${incomeToDelete?.source} entry for ₹${incomeToDelete?.amount?.toLocaleString('en-IN')}?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIncomeToDelete(null)}
        isDanger={true}
      />
    </div>
  );
};

export default Income;
