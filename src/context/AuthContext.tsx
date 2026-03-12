import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';

export type UserRole = 'member' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (data: { username: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios instance — all requests go through here
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true, // sends the refreshToken cookie automatically
});

// Attach token to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blesspay_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('blesspay_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('blesspay_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist user + token to localStorage so refresh doesn't log you out
  const persist = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('blesspay_user', JSON.stringify(userData));
    localStorage.setItem('blesspay_token', accessToken);
  };

  const clear = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('blesspay_user');
    localStorage.removeItem('blesspay_token');
  };

  const login = useCallback(async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      persist(data.user, data.accessToken);
      return data.user; // returned so AuthPage can use username in toast
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      // backend returns data.admin not data.user for admin login
      const adminUser: User = { ...data.admin, phone: data.admin.phone ?? '' };
      persist(adminUser, data.accessToken);
      return adminUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    payload: { username: string; email: string; phone: string; password: string }
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persist(data.user, data.accessToken);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout'); // clears refreshToken cookie on backend
    } catch {
      // clear locally even if backend call fails
    } finally {
      clear();
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    setIsLoading(true);
    try {
      const { data: updated } = await api.put('/user/profile', data);
      const merged = { ...user!, ...updated.user };
      setUser(merged);
      localStorage.setItem('blesspay_user', JSON.stringify(merged));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const changePassword = useCallback(async (current: string, newPass: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api.put('/user/change-password', { currentPassword: current, newPassword: newPass });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, adminLogin, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};