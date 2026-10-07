import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import AddExpense from './pages/AddExpense.jsx';
import EditExpense from './pages/EditExpense.jsx';
import Income from './pages/Income.jsx';
import Budget from './pages/Budget.jsx';
import Analytics from './pages/Analytics.jsx';
import Recommendations from './pages/Recommendations.jsx';
import SuggestionsGuide from './pages/SuggestionsGuide.jsx';
import Goals from './pages/Goals.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';

// Main App Layout Wrapper for Protected Pages
const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-emerald-50/50 dark:bg-[#022019] text-slate-900 dark:text-emerald-50 flex flex-col transition-colors duration-500 overflow-hidden relative">
      {/* Premium Ambient Background - Professional Finance Green Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-[120px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-green-400/20 dark:bg-emerald-600/10 blur-[150px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-50 w-full flex-none">
        <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </div>
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes inside AppLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/expenses/add" element={<AddExpense />} />
                <Route path="/expenses/edit/:id" element={<EditExpense />} />
                <Route path="/income" element={<Income />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/suggestions" element={<SuggestionsGuide />} />
                <Route path="/recommendations" element={<SuggestionsGuide />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Fallback & Root Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
