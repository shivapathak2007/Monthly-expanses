import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { expenseService } from '../services/api.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const res = await expenseService.getExpenseById(id);
        if (res.data?.success) {
          setExpense(res.data.data);
        }
      } catch (err) {
        setError('Expense not found or unauthorized');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleUpdate = async (formData) => {
    await expenseService.updateExpense(id, formData);
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/expenses');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading expense details...</p>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="max-w-2xl mx-auto p-8 card-premium text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">{error || 'Expense not found'}</h3>
        <Link to="/expenses" className="btn-primary mt-4 py-2 px-4 text-xs inline-flex">
          Back to Expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/expenses"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Expense</h1>
          <p className="text-xs text-slate-500">Modify details, categories, or need/want tags.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Expense updated successfully! Redirecting...</span>
        </div>
      )}

      <div className="card-premium p-6 sm:p-8 bg-white">
        <ExpenseForm
          initialData={expense}
          onSubmit={handleUpdate}
          onCancel={() => navigate('/expenses')}
          submitLabel="Update Expense"
        />
      </div>
    </div>
  );
};

export default EditExpense;
