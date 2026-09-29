import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  PlusCircle,
  Menu,
  X,
  Wallet,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  UserPlus,
  Check,
  Users
} from 'lucide-react';

export const Navbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, accounts, switchAccount, logoutCurrentAccount, logoutAll } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutCurrent = async () => {
    setSwitcherOpen(false);
    await logoutCurrentAccount();
    if (!accounts || accounts.length <= 1) {
      navigate('/login');
    }
  };

  const handleLogoutAll = async () => {
    setSwitcherOpen(false);
    await logoutAll();
    navigate('/login');
  };

  const handleSwitch = async (accountId) => {
    setSwitcherOpen(false);
    await switchAccount(accountId);
  };

  const handleAddAccount = () => {
    setSwitcherOpen(false);
    navigate('/login?addAccount=true');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const otherAccounts = (accounts || []).filter((acc) => acc.id !== user?.id);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                Kharcha
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
                Personal Finance
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Quick Add, Theme Toggle, Account Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Expense */}
          <Link
            to="/expenses/add"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium text-xs rounded-xl shadow-sm shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Instagram-style Account Switcher Dropdown */}
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Account menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs flex items-center justify-center shadow-inner relative">
                {getInitials(user?.name)}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.name || 'Account'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" />
            </button>

            {/* Switcher Dropdown Popover */}
            {switcherOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
                {/* Active Account Header */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {getInitials(user?.name)}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user?.name}
                        </span>
                        <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setSwitcherOpen(false)}
                    className="mt-2 block text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    View & Edit Profile →
                  </Link>
                </div>

                {/* Other Saved Accounts */}
                {otherAccounts.length > 0 && (
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Switch Account
                    </p>
                    {otherAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitch(acc.id)}
                        className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center">
                            {getInitials(acc.name)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600">
                              {acc.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                              {acc.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Switch
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Add Account Option */}
                <div className="py-1">
                  <button
                    onClick={handleAddAccount}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 transition-colors text-left"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Account</span>
                  </button>
                </div>

                {/* Logout Actions */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={handleLogoutCurrent}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out current account</span>
                  </button>

                  <button
                    onClick={handleLogoutAll}
                    className="w-full px-4 py-2 flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-[11px]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Log out of all accounts</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
