import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { userService } from '../services/api.js';
import formatCurrency from '../utils/formatCurrency.js';
import { formatDateFriendly } from '../utils/dateUtils.js';
import {
  User,
  Mail,
  Calendar,
  Lock,
  IndianRupee,
  CheckCircle2,
  Shield,
  Save
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await userService.updateProfile({
        name,
        age: Number(age),
        monthly_income: Number(monthlyIncome),
        currency
      });

      if (res.data?.success) {
        updateUserProfile(res.data.data);
        setProfileSuccess('Profile updated successfully! ✨');
      }
    } catch (err) {
      setProfileError(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await userService.changePassword({
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully! 🔐');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Profile & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, monthly income, currency and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Summary Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="card-premium p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'U'}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Age:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Monthly Income:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(user?.monthly_income, user?.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Primary Currency:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.currency || 'INR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Joined:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDateFriendly(user?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Card */}
          <div className="card-premium p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Personal Details</span>
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="label-field">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label-field">Age</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Monthly Income / Inflow</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card-premium p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Change Password</span>
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="label-field">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-field">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label-field">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary py-2 px-4 text-xs font-semibold"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
