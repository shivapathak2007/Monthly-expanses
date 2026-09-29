import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Wallet, Lock, Mail, User, Calendar, IndianRupee, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '17',
    monthly_income: '5000',
    currency: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setFormError('Please enter a valid age between 10 and 100');
      return;
    }

    setLoading(true);
    const result = await register({
      ...formData,
      age: ageNum,
      monthly_income: Number(formData.monthly_income) || 0
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-3">
          <Wallet className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Join <span className="text-brand-600 dark:text-brand-400">Kharcha</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Personal expense tracking and smart money management for everyone.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
          {formError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="label-field">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Shiva Pathak"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Age</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    name="age"
                    min="10"
                    max="100"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Monthly Income / Inflow</label>
                <div className="relative">
                  <span className="text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-xs">₹</span>
                  <input
                    type="number"
                    name="monthly_income"
                    min="0"
                    value={formData.monthly_income}
                    onChange={handleChange}
                    placeholder="25000"
                    className="input-field pl-7"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
