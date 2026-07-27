import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/api';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('spineit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('spineit_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem('spineit_user', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      localStorage.removeItem('spineit_access_token');
      localStorage.removeItem('spineit_refresh_token');
      localStorage.removeItem('spineit_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Listen for auth change events (e.g. token refresh failures)
    const handleAuthChange = () => {
      fetchUserProfile();
    };

    window.addEventListener('spineit_auth_change', handleAuthChange);
    return () => window.removeEventListener('spineit_auth_change', handleAuthChange);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const tokens = await api.login(credentials);
      localStorage.setItem('spineit_access_token', tokens.access);
      localStorage.setItem('spineit_refresh_token', tokens.refresh);
      await fetchUserProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      await api.register(userData);
      // Auto login after successful registration
      await login({ username: userData.username, password: userData.password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const refreshToken = localStorage.getItem('spineit_refresh_token');
    try {
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('spineit_access_token');
      localStorage.removeItem('spineit_refresh_token');
      localStorage.removeItem('spineit_user');
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
