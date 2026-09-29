import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { expenseService, incomeService } from '../services/api.js';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Moon,
  Sun,
  Database,
  CheckCircle2,
  Palette
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportData = async () => {
    try {
      setExporting(true);
      const [expRes, incRes] = await Promise.all([
        expenseService.getExpenses({ limit: 1000 }),
        incomeService.getIncome({ limit: 1000 })
      ]);

      const exportObject = {
        exportDate: new Date().toISOString(),
        user: {
          name: user?.name,
          email: user?.email,
          currency: user?.currency
        },
        expenses: expRes.data?.data || [],
        income: incRes.data?.data || []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `SpendWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your interface theme, backup your transactions, and view security status.
        </p>
      </div>

      {/* Theme Preference */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Theme Mode</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between modern clean Light mode and sleek Dark mode
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

      {/* Backup & Export */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Backup & Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download a full JSON backup of all your recorded transactions</p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="my-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Transactions backup downloaded successfully!</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-400">Export format: JSON (Compatible with Excel & Sheets)</span>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            {exporting ? 'Exporting...' : 'Export All Transactions'}
          </button>
        </div>
      </div>

      {/* Security Architecture */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Privacy Architecture</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">How your financial records are secured</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Bcrypt 12 Salt Rounds:</strong> Passwords are never stored in plaintext and never transmitted in API responses.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>JWT Stateless Sessions:</strong> Signed JSON Web Tokens with strict 7-day expiration.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Strict User Scoping:</strong> Every database query is strictly filtered by the authenticated user ID on the backend server.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            <span><strong>Supabase PostgreSQL:</strong> Enterprise-grade database storage with Row-Level Security policies.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
