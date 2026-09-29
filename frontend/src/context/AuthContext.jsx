import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Helper to read initial accounts
  const getInitialAccounts = () => {
    try {
      const stored = localStorage.getItem('kharcha_accounts');
      if (stored) return JSON.parse(stored);

      // Migration fallback from single-account keys
      const oldToken = localStorage.getItem('kharcha_token') || localStorage.getItem('spendwise_token');
      const oldUserStr = localStorage.getItem('kharcha_user') || localStorage.getItem('spendwise_user');
      if (oldToken && oldUserStr) {
        const parsed = JSON.parse(oldUserStr);
        const migrated = [{
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          currency: parsed.currency || 'INR',
          token: oldToken
        }];
        localStorage.setItem('kharcha_accounts', JSON.stringify(migrated));
        return migrated;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const [accounts, setAccounts] = useState(getInitialAccounts);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kharcha_user') || localStorage.getItem('spendwise_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('kharcha_token') || localStorage.getItem('spendwise_token');
  });

  const [loading, setLoading] = useState(() => {
    return !(localStorage.getItem('kharcha_token') || localStorage.getItem('spendwise_token'));
  });

  const [error, setError] = useState(null);

  // Sync active account credentials into localStorage
  const syncActiveSession = (activeUser, activeToken, accountsList) => {
    if (activeUser && activeToken) {
      localStorage.setItem('kharcha_token', activeToken);
      localStorage.setItem('kharcha_user', JSON.stringify(activeUser));
      // Keep spendwise keys for seamless backward compatibility
      localStorage.setItem('spendwise_token', activeToken);
      localStorage.setItem('spendwise_user', JSON.stringify(activeUser));
    } else {
      localStorage.removeItem('kharcha_token');
      localStorage.removeItem('kharcha_user');
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    }

    if (accountsList) {
      localStorage.setItem('kharcha_accounts', JSON.stringify(accountsList));
    }
  };

  // Check current session on mount in background
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('kharcha_token') || localStorage.getItem('spendwise_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.data && res.data.data && res.data.data.user) {
            const currentUser = res.data.data.user;
            setUser(currentUser);

            // Update user in accounts list
            setAccounts((prev) => {
              const updated = prev.map((acc) =>
                acc.id === currentUser.id
                  ? { ...acc, name: currentUser.name, email: currentUser.email, currency: currentUser.currency, token: storedToken }
                  : acc
              );
              syncActiveSession(currentUser, storedToken, updated);
              return updated;
            });
          }
        } catch (err) {
          console.warn('Session verification notice:', err);
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            logoutCurrentAccount();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, isAddAccount = false) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      const { user: loggedInUser, token: authToken } = res.data.data;

      const accountObj = {
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        currency: loggedInUser.currency || 'INR',
        token: authToken
      };

      setUser(loggedInUser);
      setToken(authToken);

      setAccounts((prev) => {
        const filtered = prev.filter((acc) => acc.id !== loggedInUser.id);
        const updated = [accountObj, ...filtered];
        syncActiveSession(loggedInUser, authToken, updated);
        return updated;
      });

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await authService.register(formData);
      const { user: registeredUser, token: authToken } = res.data.data;

      const accountObj = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        currency: registeredUser.currency || 'INR',
        token: authToken
      };

      setUser(registeredUser);
      setToken(authToken);

      setAccounts((prev) => {
        const filtered = prev.filter((acc) => acc.id !== registeredUser.id);
        const updated = [accountObj, ...filtered];
        syncActiveSession(registeredUser, authToken, updated);
        return updated;
      });

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const switchAccount = async (targetAccountId) => {
    const target = accounts.find((acc) => acc.id === targetAccountId);
    if (!target) return;

    setUser(target);
    setToken(target.token);
    syncActiveSession(target, target.token, accounts);

    // Refresh live profile in background
    try {
      const res = await authService.getCurrentUser();
      if (res.data?.data?.user) {
        const freshUser = res.data.data.user;
        setUser(freshUser);
        const updatedAccounts = accounts.map((acc) =>
          acc.id === targetAccountId ? { ...acc, ...freshUser, token: target.token } : acc
        );
        setAccounts(updatedAccounts);
        syncActiveSession(freshUser, target.token, updatedAccounts);
      }
    } catch (e) {
      console.warn('Switched account session verification warning:', e);
    }
  };

  const logoutCurrentAccount = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }

    const currentId = user?.id;
    const remaining = accounts.filter((acc) => acc.id !== currentId);
    setAccounts(remaining);

    if (remaining.length > 0) {
      // Switch to first remaining account
      const nextAccount = remaining[0];
      setUser(nextAccount);
      setToken(nextAccount.token);
      syncActiveSession(nextAccount, nextAccount.token, remaining);
    } else {
      setUser(null);
      setToken(null);
      syncActiveSession(null, null, []);
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors
    }
    setUser(null);
    setToken(null);
    setAccounts([]);
    localStorage.removeItem('kharcha_token');
    localStorage.removeItem('kharcha_user');
    localStorage.removeItem('kharcha_accounts');
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
  };

  const removeAccount = (accountId) => {
    const remaining = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(remaining);
    localStorage.setItem('kharcha_accounts', JSON.stringify(remaining));

    if (user?.id === accountId) {
      if (remaining.length > 0) {
        switchAccount(remaining[0].id);
      } else {
        logoutAll();
      }
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('kharcha_user', JSON.stringify(updatedUser));
    localStorage.setItem('spendwise_user', JSON.stringify(updatedUser));
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedUser.id ? { ...acc, ...updatedUser } : acc))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        accounts,
        loading,
        error,
        login,
        register,
        logout: logoutCurrentAccount,
        logoutCurrentAccount,
        logoutAll,
        switchAccount,
        removeAccount,
        updateUserProfile,
        isAuthenticated: Boolean(user && token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
