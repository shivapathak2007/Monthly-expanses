import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
  LayoutDashboard,
  ReceiptText,
  BadgeDollarSign,
  PieChart,
  BarChart3,
  Lightbulb,
  Target,
  User,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ReceiptText },
    { name: 'Income', path: '/income', icon: BadgeDollarSign },
    { name: 'Budgets', path: '/budget', icon: PieChart },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: '💡 Suggestions & Guide', path: '/suggestions', icon: Lightbulb },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 md:static md:z-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header in drawer for mobile */}
          <div className="flex items-center gap-2.5 px-3 py-2 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              Kharcha
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Menu
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/70 text-brand-600 dark:text-brand-400 font-semibold shadow-sm shadow-brand-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Habit Tip & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-indigo-950/30 rounded-xl border border-brand-100/60 dark:border-brand-900/40">
            <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-300 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Habit Tip</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Track small ₹50 snacks daily — they add up to ₹1,500 every month!
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
