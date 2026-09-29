import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('spendwise_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('spendwise_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res.data && res.data.data && res.data.data.user) {
            setUser(res.data.data.user);
            localStorage.setItem('spendwise_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      const { user: loggedInUser, token: authToken } = res.data.data;

      setUser(loggedInUser);
      setToken(authToken);

      localStorage.setItem('spendwise_token', authToken);
      localStorage.setItem('spendwise_user', JSON.stringify(loggedInUser));

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

      setUser(registeredUser);
      setToken(authToken);

      localStorage.setItem('spendwise_token', authToken);
      localStorage.setItem('spendwise_user', JSON.stringify(registeredUser));

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout request errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('spendwise_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: Boolean(user && token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
