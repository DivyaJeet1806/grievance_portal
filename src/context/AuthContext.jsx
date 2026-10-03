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
        try {
          const json = await res.json();
          if (json && json.success && json.user) {
            setUser(json.user);
            setCurrentView('portal'); // valid saved token → skip login form
            setLoading(false);
            return;
          }
        } catch {
          // If response isn't JSON, don't crash
        }
      }
      // If verification failed (e.g. expired or 401)
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setCurrentView('login');
      }
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
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (networkErr) {
      // Backend completely unreachable (e.g. server offline)
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      if (cleanEmail === 'student@campus.edu' && password === 'student123') {
        const demoUser = {
          id: 'USR-STUDENT-01',
          name: 'Rahul Sharma',
          email: 'student@campus.edu',
          role: 'student',
          department: 'Computer Science & Engineering',
          rollNumber: 'CS-2023-45'
        };
        setUser(demoUser);
        setIsAuthModalOpen(false);
        setCurrentView('portal');
        return demoUser;
      }
      if (cleanEmail === 'admin@campus.edu' && password === 'admin123') {
        const demoAdmin = {
          id: 'USR-ADMIN-01',
          name: 'Dr. Anita Rao (Dean of Student Welfare)',
          email: 'admin@campus.edu',
          role: 'admin',
          department: 'Student Affairs & Redressal Desk'
        };
        setUser(demoAdmin);
        setIsAuthModalOpen(false);
        setCurrentView('portal');
        return demoAdmin;
      }
      throw new Error('Cannot reach API server. Please ensure the backend server is running on port 5000.');
    }

    let json = null;
    try {
      json = await res.json();
    } catch {
      // Non-JSON response (e.g. 502 Bad Gateway empty body from proxy)
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      if (cleanEmail === 'student@campus.edu' && password === 'student123') {
        const demoUser = {
          id: 'USR-STUDENT-01',
          name: 'Rahul Sharma',
          email: 'student@campus.edu',
          role: 'student',
          department: 'Computer Science & Engineering',
          rollNumber: 'CS-2023-45'
        };
        setUser(demoUser);
        setIsAuthModalOpen(false);
        setCurrentView('portal');
        return demoUser;
      }
      if (cleanEmail === 'admin@campus.edu' && password === 'admin123') {
        const demoAdmin = {
          id: 'USR-ADMIN-01',
          name: 'Dr. Anita Rao (Dean of Student Welfare)',
          email: 'admin@campus.edu',
          role: 'admin',
          department: 'Student Affairs & Redressal Desk'
        };
        setUser(demoAdmin);
        setIsAuthModalOpen(false);
        setCurrentView('portal');
        return demoAdmin;
      }
      throw new Error(`Server returned status ${res.status}. Please ensure backend server is running.`);
    }

    if (!res.ok || !json.success) {
      throw new Error(json?.message || 'Login failed. Please check your credentials.');
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
    let res;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch {
      throw new Error('Cannot reach API server. Please ensure the backend server is running on port 5000.');
    }

    let json = null;
    try {
      json = await res.json();
    } catch {
      throw new Error(`Server returned status ${res.status}. Please ensure backend server is running.`);
    }

    if (!res.ok || !json.success) {
      throw new Error(json?.message || 'Registration failed.');
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
