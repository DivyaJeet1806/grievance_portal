import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const TOKEN_KEY = 'grievancehub_auth_token_v1';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ALWAYS start at login — verifyToken will auto-advance to portal if token is valid
  const [currentView, setCurrentView] = useState('login');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Verify token on mount or token change
  const verifyToken = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
          setCurrentView('portal'); // valid saved token → skip login form
          setLoading(false);
          return;
        }
      }
      // If verification failed (e.g. expired)
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setCurrentView('login');
    } catch (err) {
      console.warn('Auth verification network error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyToken(token);
  }, [token, verifyToken]);

  // Login action
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Login failed.');
    }

    localStorage.setItem(TOKEN_KEY, json.token);
    setToken(json.token);
    setUser(json.user);
    setIsAuthModalOpen(false);
    setCurrentView('portal');
    return json.user;
  };

  // Register action
  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Registration failed.');
    }

    localStorage.setItem(TOKEN_KEY, json.token);
    setToken(json.token);
    setUser(json.user);
    setIsAuthModalOpen(false);
    setCurrentView('portal');
    return json.user;
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  // Auth Header helper for fetch requests
  const getAuthHeaders = () => {
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        currentView,
        setCurrentView,
        login,
        register,
        logout,
        getAuthHeaders,
        isAuthModalOpen,
        setIsAuthModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
