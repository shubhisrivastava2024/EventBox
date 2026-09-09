import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@eventbox.com', password: 'password123', name: 'Admin User', role: 'admin' },
  organizer: { email: 'organizer@eventbox.com', password: 'password123', name: 'Event Organizer', role: 'organizer' },
  customer: { email: 'customer@eventbox.com', password: 'password123', name: 'John Customer', role: 'customer' },
  entry_manager: { email: 'entry@eventbox.com', password: 'password123', name: 'Entry Officer Alex', role: 'entry_manager' },
  support: { email: 'support@eventbox.com', password: 'password123', name: 'Support Rep Sarah', role: 'support' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((res) => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      // Default auto-login as Customer for quick start if token is empty
      quickSwitchRole('customer').finally(() => setLoading(false));
    }
  }, []);

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user_id, name, role } = res.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    const userData = { id: user_id, email, name, role };
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, role) => {
    const res = await authAPI.signup({ name, email, password, role });
    const { access_token, user_id } = res.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    const userData = { id: user_id, email, name, role };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (roleName) => {
    const demo = DEMO_ACCOUNTS[roleName];
    if (demo) {
      try {
        const userData = await login(demo.email, demo.password);
        return userData;
      } catch (err) {
        console.error("Demo login error:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        quickSwitchRole,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
