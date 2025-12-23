'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login, register, getCurrentUser, refreshToken, logout as apiLogout, UserResponse, LoginRequest, RegisterRequest } from '@/services/authApi';

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshAccessToken();
      }, 25 * 60 * 1000); // Refresh every 25 minutes (token expires in 30)

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          // Verify token is still valid by fetching user
          const userData = await getCurrentUser(accessToken);
          setUser(userData);
          // Update stored user
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          // Token expired, try to refresh
          const refreshTokenValue = localStorage.getItem('refresh_token');
          if (refreshTokenValue) {
            try {
              const tokens = await refreshAccessToken();
              if (tokens) {
                const userData = await getCurrentUser(tokens.access_token);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
              } else {
                throw new Error('Failed to refresh');
              }
            } catch (refreshError) {
              // Refresh failed, clear everything
              apiLogout();
              setUser(null);
            }
          } else {
            apiLogout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      apiLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async (): Promise<{ access_token: string; refresh_token: string } | null> => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) return null;

      const tokens = await refreshToken(refreshTokenValue);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      return tokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const handleLogin = async (data: LoginRequest) => {
    const tokens = await login(data);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    const userData = await getCurrentUser(tokens.access_token);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleRegister = async (data: RegisterRequest) => {
    await register(data);
    // After registration, automatically login
    await handleLogin({ email: data.email, password: data.password });
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
  };

  const handleRefreshUser = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const userData = await getCurrentUser(accessToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser: handleRefreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

