import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { exportService, userService } from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Moon,
  Sun,
  Database,
  CheckCircle2,
  Palette,
  Users,
  UserPlus,
  FileSpreadsheet,
  Eye,
  AlertTriangle,
  Trash2,
  Cloud,
  Lock,
  ArrowRight,
  RefreshCw,
  LogOut,
  X
} from 'lucide-react';

export const Settings = () => {
  const { user, accounts, switchAccount, logoutCurrentAccount, logoutAll } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Excel Export & Preview State
  const [exportLoading, setExportLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('summary'); // 'summary' | 'expenses' | 'income' | 'budgets' | 'goals'
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Account Deletion Flow
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const currency = user?.currency || 'INR';

  // Fetch structured data for in-app Excel preview
  const handleOpenPreview = async () => {
    try {
      setPreviewLoading(true);
      const res = await exportService.getPreview();
      if (res.data?.success) {
        setPreviewData(res.data.data);
        setShowPreviewModal(true);
      }
    } catch (err) {
      alert('Could not load data preview. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download authentic .xlsx generated via ExcelJS on the backend
  const handleDownloadExcel = async () => {
    try {
      setExportLoading(true);
      const res = await exportService.downloadExcel();

      // Create blob from response data
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Kharcha_Export_${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate Excel export. Please check connection and try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Permanent Account Deletion
  const handleConfirmAccountDeletion = async () => {
    if (deleteConfirmationText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type exact confirmation text: DELETE MY ACCOUNT');
      return;
    }

    try {
      setDeletingAccount(true);
      setDeleteError('');
      await userService.deleteAccount();

      // Clear local storage & session
      await logoutAll();
      setShowDeleteModal(false);
      navigate('/login?deleted=true', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Data Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Export your financial records to Excel, manage multiple accounts, view cloud storage persistence, and configure security.
        </p>
      </div>

      {/* 1. Theme Mode Preference */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between clean modern Light mode and sleek Dark mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Download My Data & Real Excel Export (.xlsx) */}
      <div className="card-premium p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export My Data (.xlsx)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate an authentic multi-sheet Microsoft Excel workbook with formulas & formatting
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            Real ExcelJS
          </span>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Excel workbook generated and downloaded successfully!</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Your exported workbook will include 5 organized sheets:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>• <strong>Sheet 1: Summary</strong> — Total income, expenses, savings rate & record count</div>
            <div>• <strong>Sheet 2: Expenses</strong> — Complete ledger with categories, need/want & notes</div>
            <div>• <strong>Sheet 3: Income</strong> — All inflows, salaries, and allowances with dates</div>
            <div>• <strong>Sheet 4: Budgets</strong> — Category allocations, spent amounts & % utilized</div>
            <div>• <strong>Sheet 5: Goals</strong> — Financial targets, deadlines & progress tracking</div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Format: Genuine .xlsx file (100% compatible with MS Excel, Google Sheets, LibreOffice)
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleOpenPreview}
              disabled={previewLoading}
              className="btn-secondary py-2 px-4 text-xs font-semibold flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>{previewLoading ? 'Loading Preview...' : 'Preview in App'}</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              disabled={exportLoading}
              className="btn-primary py-2 px-4 text-xs font-semibold flex-1 sm:flex-initial flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{exportLoading ? 'Generating XLSX...' : 'Download Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Account Switching (Instagram Style) */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Account Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved accounts on this device with seamless 1-click switching
              </p>
            </div>
          </div>

          <Link
            to="/login?addAccount=true"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Account</span>
          </Link>
        </div>

        <div className="space-y-2 pt-2">
          {(accounts || []).map((acc) => {
            const isActive = acc.id === user?.id;
            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isActive
                    ? 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {acc.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</p>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          Active Account
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{acc.email}</p>
                  </div>
                </div>

                {!isActive && (
                  <button
                    onClick={() => switchAccount(acc.id)}
                    className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                  >
                    Switch to this Account
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Cloud Storage Persistence Notice */}
      <div className="card-premium p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cloud Storage & Data Persistence</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Where and how your records are stored</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>Persistent Cloud Storage:</strong> Your financial data is securely stored in cloud infrastructure and remains safely available whenever you sign back in.
          </p>
          <p>
            <strong>Logging out does not delete your data:</strong> Logging out only terminates your local browser session. Your transactions, budgets, income, and goals remain intact in the database.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Kharcha utilizes a pluggable storage architecture supporting Supabase PostgreSQL as primary database, with optional abstraction for future expansion to Google Cloud Storage.
          </p>
        </div>
      </div>

      {/* 5. Security & Isolation */}
      <div className="card-premium p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Privacy Architecture</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Multi-tier safeguards protecting your account</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Strict User Data Isolation:</strong> Every backend API strictly filters records by your authenticated user ID. No user can ever view, export, or delete another user's financial records.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Bcrypt Password Hashing:</strong> Passwords are hashed with salt rounds before saving and are never stored in plaintext or exposed in API responses.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Signed JWT Sessions:</strong> Stateless cryptographically signed tokens with automatic expiry.</span>
          </div>
        </div>
      </div>

      {/* 6. Destructive Actions: Delete Account */}
      <div className="card-premium p-6 border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">Danger Zone: Permanent Account Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Permanently delete your Kharcha account and all associated data</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Deleting your account will permanently purge your profile, recorded expenses, income records, monthly budgets, and financial goals from our database. This action cannot be undone.
        </p>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              setDeleteConfirmationText('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* IN-APP EXCEL SPREADSHEET PREVIEW MODAL */}
      {/* ========================================================= */}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Data Export Preview (Kharcha_Export.xlsx)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Export Date: {new Date(previewData.exportDate).toLocaleDateString()} • {previewData.summary?.expenseCount} Expenses • {previewData.summary?.incomeCount} Income
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadExcel}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download XLSX</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Sheet Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
              {[
                { key: 'summary', label: '📊 Summary' },
                { key: 'expenses', label: `💸 Expenses (${previewData.expenses?.length || 0})` },
                { key: 'income', label: `💰 Income (${previewData.income?.length || 0})` },
                { key: 'budgets', label: `🎯 Budgets (${previewData.budgets?.length || 0})` },
                { key: 'goals', label: `🏆 Goals (${previewData.goals?.length || 0})` }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setPreviewTab(tab.key)}
                  className={`px-3.5 py-2 border-b-2 whitespace-nowrap transition-colors ${
                    previewTab === tab.key
                      ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Table Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs">
              {/* SHEET 1: Summary Preview */}
              {previewTab === 'summary' && (
                <div className="space-y-4 font-sans">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-500">Total Income</p>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">
                        {formatCurrency(previewData.summary?.totalIncome, currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-500">Total Expenses</p>
                      <p className="text-base font-bold text-rose-600 mt-0.5">
                        {formatCurrency(previewData.summary?.totalExpenses, currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-500">Net Savings</p>
                      <p className="text-base font-bold text-brand-600 mt-0.5">
                        {formatCurrency(previewData.summary?.totalSavings, currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] text-slate-500">Savings Rate</p>
                      <p className="text-base font-bold text-indigo-600 mt-0.5">
                        {previewData.summary?.savingsRate}%
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1.5 text-xs">
                    <p><strong>Account Name:</strong> {previewData.user?.name}</p>
                    <p><strong>Email:</strong> {previewData.user?.email}</p>
                    <p><strong>Currency:</strong> {previewData.user?.currency}</p>
                  </div>
                </div>
              )}

              {/* SHEET 2: Expenses Preview */}
              {previewTab === 'expenses' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                    <thead className="bg-brand-700 text-white text-[11px] font-bold">
                      <tr>
                        <th className="p-2 border border-brand-800">Date</th>
                        <th className="p-2 border border-brand-800">Description</th>
                        <th className="p-2 border border-brand-800">Category</th>
                        <th className="p-2 border border-brand-800 text-right">Amount</th>
                        <th className="p-2 border border-brand-800">Payment</th>
                        <th className="p-2 border border-brand-800">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                      {previewData.expenses?.map((exp, idx) => (
                        <tr key={exp.id} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{exp.expense_date}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-sans">{exp.description}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700">{exp.category}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-bold text-rose-600">
                            -{formatCurrency(exp.amount, currency)}
                          </td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700">{exp.payment_method}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 uppercase">{exp.expense_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SHEET 3: Income Preview */}
              {previewTab === 'income' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                    <thead className="bg-emerald-700 text-white text-[11px] font-bold">
                      <tr>
                        <th className="p-2 border border-emerald-800">Date</th>
                        <th className="p-2 border border-emerald-800">Source</th>
                        <th className="p-2 border border-emerald-800">Description</th>
                        <th className="p-2 border border-emerald-800 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                      {previewData.income?.map((inc, idx) => (
                        <tr key={inc.id} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 whitespace-nowrap">{inc.income_date}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-sans font-bold">{inc.source}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-sans">{inc.description || '—'}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-bold text-emerald-600">
                            +{formatCurrency(inc.amount, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SHEET 4: Budgets Preview */}
              {previewTab === 'budgets' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                    <thead className="bg-brand-700 text-white text-[11px] font-bold">
                      <tr>
                        <th className="p-2 border border-brand-800">Category / Item</th>
                        <th className="p-2 border border-brand-800 text-right">Budget</th>
                        <th className="p-2 border border-brand-800 text-right">Spent</th>
                        <th className="p-2 border border-brand-800 text-right">Remaining</th>
                        <th className="p-2 border border-brand-800 text-center">% Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                      {previewData.budgets?.map((b, idx) => (
                        <tr key={b.id} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-sans font-bold">{b.category}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">{formatCurrency(b.amount, currency)}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right font-bold text-rose-600">{formatCurrency(b.amountSpent, currency)}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">{formatCurrency(b.remaining, currency)}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold">{b.percentageUsed}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SHEET 5: Goals Preview */}
              {previewTab === 'goals' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                    <thead className="bg-brand-700 text-white text-[11px] font-bold">
                      <tr>
                        <th className="p-2 border border-brand-800">Goal Name</th>
                        <th className="p-2 border border-brand-800 text-right">Target</th>
                        <th className="p-2 border border-brand-800 text-right">Current</th>
                        <th className="p-2 border border-brand-800 text-center">Progress %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-[11px]">
                      {previewData.goals?.map((g, idx) => (
                        <tr key={g.id} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 font-sans font-bold">{g.name}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right">{formatCurrency(g.target_amount, currency)}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-right text-emerald-600 font-bold">{formatCurrency(g.current_amount, currency)}</td>
                          <td className="p-2 border border-slate-200 dark:border-slate-700 text-center font-bold">{g.progressPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DESTRUCTIVE ACCOUNT DELETION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 relative space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Permanently Delete Account?
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  This action is irreversible
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                This will immediately and permanently delete:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>All your recorded expenses</li>
                <li>All your recorded income</li>
                <li>All item and category budgets</li>
                <li>All your financial goals</li>
                <li>Your profile and login credentials</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs rounded-xl font-semibold">
                {deleteError}
              </div>
            )}

            <div>
              <label className="label-field text-xs text-slate-700 dark:text-slate-300 font-semibold">
                To confirm, please type: <span className="font-mono text-rose-600 dark:text-rose-400">DELETE MY ACCOUNT</span>
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="input-field mt-1 text-center font-mono font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE MY ACCOUNT' || deletingAccount}
                onClick={handleConfirmAccountDeletion}
                className="btn-danger py-2.5 px-4 text-xs font-semibold flex-1 disabled:opacity-40"
              >
                {deletingAccount ? 'Deleting Forever...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
