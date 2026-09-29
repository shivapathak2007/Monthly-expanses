import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title || 'Confirm Action'}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          {message || 'This action cannot be undone. Are you sure you wish to continue?'}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary py-2 px-4 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={isDanger ? 'btn-danger py-2 px-4 text-xs font-semibold' : 'btn-primary py-2 px-4 text-xs font-semibold'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
