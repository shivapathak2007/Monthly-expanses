import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { expenseService } from '../services/api.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import { ArrowLeft, CheckCircle2, PlusCircle } from 'lucide-react';

export const AddExpense = () => {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCreate = async (formData) => {
    await expenseService.createExpense(formData);
    setSuccessMsg(true);
    setTimeout(() => {
      navigate('/expenses');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Top back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/expenses"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add Expense</h1>
          <p className="text-xs text-slate-500">Record a new purchase, commute, food or subscription.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Expense added successfully 🎉 Redirecting to expense list...</span>
        </div>
      )}

      <div className="card-premium p-6 sm:p-8 bg-white">
        <ExpenseForm
          onSubmit={handleCreate}
          onCancel={() => navigate('/expenses')}
          submitLabel="Save Expense"
        />
      </div>
    </div>
  );
};

export default AddExpense;
