import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  darkMode: boolean;
  login: (loginData: { username: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  register: (registerData: {
    username: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  }) => Promise<User>;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) === true : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const bodyClass = document.documentElement.classList;
    if (darkMode) {
      bodyClass.add('dark');
      document.body.classList.add('dark');
    } else {
      bodyClass.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    let cancelled = false;

    const finishLoading = () => {
      if (!cancelled) setLoading(false);
    };

    const safetyTimer = window.setTimeout(finishLoading, 12000);

    const checkSession = async () => {
      try {
        const response = await api.get<User>('/api/auth/me', {
          validateStatus: (status) => status === 200 || status === 401,
        });
        if (!cancelled && response.status === 200) {
          setUser(response.data);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        window.clearTimeout(safetyTimer);
        finishLoading();
      }
    };

    checkSession();

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (loginData: { username: string; password: string }) => {
    try {
      const response = await api.post<User>('/api/auth/login', loginData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error("Logout API failed, clearing local state...", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const register = async (registerData: {
    username: string;
    password: string;
    fullName: string;
    phoneNumber: string;
  }) => {
    const response = await api.post<User>('/api/auth/register', registerData);
    return response.data;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        login,
        logout,
        register,
        toggleDarkMode,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
