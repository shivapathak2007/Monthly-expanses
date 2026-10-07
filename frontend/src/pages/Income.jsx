import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  CheckSquare,
  Square
} from 'lucide-react';

const SOURCE_ICONS = {
  Salary: '💼',
  Freelance: '💻',
  Business: '🏢',
  Investment: '📈',
  Allowance: '👨‍👩‍👧',
  'Pocket Money': '👨‍👩‍👧',
  Gift: '🎁',
  Scholarship: '🎓',
  Other: '💵'
};

export const Income = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Add / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [incomeToDelete, setIncomeToDelete] = useState(null);

  // Bulk Selection States
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const currency = user?.currency || 'INR';

  const {
    data: responseData,
    isLoading: loading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const res = await incomeService.getIncome();
      return res.data;
    }
  });

  const incomes = responseData?.data || [];
  const error = isError ? 'Could not load income records' : '';
  const fetchIncomes = refetch;

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  const saveMutation = useMutation({
    mutationFn: (formData) => {
      if (editingIncome) {
        return incomeService.updateIncome(editingIncome.id, formData);
      }
      return incomeService.createIncome(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setIsModalOpen(false);
      setEditingIncome(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => incomeService.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setIncomeToDelete(null);
    },
    onError: (err) => {
      alert('Failed to delete income: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSaveIncome = (formData) => saveMutation.mutate(formData);
  const handleDeleteConfirm = () => deleteMutation.mutate(incomeToDelete.id);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === incomes.length && incomes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(incomes.map((i) => i.id));
    }
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => incomeService.bulkDeleteIncome(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      setIsSelectMode(false);
    },
    onError: (err) => {
      alert(
        'Failed to delete selected income entries: ' + (err.response?.data?.message || err.message)
      );
    }
  });

  const handleBulkDeleteConfirm = () => bulkDeleteMutation.mutate(selectedIds);
  const bulkDeleting = bulkDeleteMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Income & Inflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track salaries, freelance earnings, investments, allowance, and gifts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedIds([]);
            }}
            className={`inline-flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
              isSelectMode
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-sm'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isSelectMode ? 'Exit Selection' : 'Select Mode'}</span>
          </button>

          <button
            onClick={() => {
              setEditingIncome(null);
              setIsModalOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-2 py-2.5 px-4 text-xs shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Toolbar */}
      {isSelectMode && (
        <div className="sticky top-20 z-20 p-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-brand-200 dark:border-brand-800 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-fade-in flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
            >
              {selectedIds.length === incomes.length && incomes.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedIds.length === incomes.length && incomes.length > 0
                  ? 'Deselect All'
                  : `Select All Visible (${incomes.length})`}
              </span>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              Selected: {selectedIds.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectMode(false);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={selectedIds.length === 0}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-rose-600/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Income History</h3>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Loading income entries...
          </div>
        ) : error ? (
          <div className="p-6 text-center card-premium text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center card-premium border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <BadgeDollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              No income recorded yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Add your salary, freelance earnings, or gifts to keep your balance accurate.
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
          <AnimatePresence>
            {incomes.map((inc, index) => {
              const isSelected = selectedIds.includes(inc.id);
              return (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    height: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    padding: 0
                  }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <div
                    onClick={() => {
                      if (isSelectMode) handleToggleSelect(inc.id);
                    }}
                    className={`card-premium p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${
                      isSelectMode ? 'cursor-pointer' : 'card-hoverable'
                    } ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-2 ring-brand-500/20 shadow-md'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(inc.id);
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            isSelected
                              ? 'text-brand-600 dark:text-brand-400'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 fill-brand-100 dark:fill-brand-950" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-xl shrink-0">
                        {SOURCE_ICONS[inc.source] || '💰'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {inc.source}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{formatDateFriendly(inc.income_date)}</span>
                          {inc.description && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 dark:text-slate-300 italic">
                                "{inc.description}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                        +{formatCurrency(inc.amount, currency)}
                      </span>
                      {!isSelectMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIncome(inc);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIncomeToDelete(inc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingIncome ? 'Edit Income Entry' : 'Record New Income'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingIncome(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
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

      {/* Single Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(incomeToDelete)}
        title="Delete Income Record?"
        message={`Are you sure you want to delete the ${incomeToDelete?.source} entry for ₹${incomeToDelete?.amount?.toLocaleString('en-IN')}?`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIncomeToDelete(null)}
        isDanger={true}
      />

      {/* Bulk Delete Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteModal}
        title="Delete Selected Income Entries?"
        message={`Are you sure you want to permanently delete ${selectedIds.length} selected income record${selectedIds.length === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmText={bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Entries`}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setShowBulkDeleteModal(false)}
        isDanger={true}
      />
    </div>
  );
};

export default Income;
