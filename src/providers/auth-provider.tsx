'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isApiError } from '@/lib/http/api-error';
import { authApi, refreshSession } from '@/auth/jwt/client';
import { SESSION_EXPIRED_EVENT } from '@/auth/jwt/config';
import { clearTokens, getAccessToken, setTokens } from '@/auth/jwt/token-storage';
import type { AuthResponse, AuthStatus, LoginRequest, RegisterRequest, User } from '@/auth/jwt/types';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Sign in; resolves with the user, rejects with ApiError (e.g. 401 wrong credentials). */
  login: (credentials: LoginRequest) => Promise<User>;
  /** Create an account and sign in. */
  register: (data: RegisterRequest) => Promise<User>;
  /** Sign out on the server (best effort) and clear local session state. */
  logout: () => Promise<void>;
  /** Re-fetch the current user (e.g. after a profile update). */
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const signedOut = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const applySession = useCallback((res: AuthResponse) => {
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
    setStatus('authenticated');
    return res.user;
  }, []);

  const refreshUser = useCallback(async () => {
    // The access token only lives in memory: after a reload, trade the refresh cookie for a new one.
    if (!getAccessToken()) await refreshSession();
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus('authenticated');
      return me;
    } catch (error) {
      if (isApiError(error) && (error.status === 401 || error.status === 403)) clearTokens();
      signedOut();
      return null;
    }
  }, [signedOut]);

  // Restore the session on first load.
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // authFetch fires this when a refresh fails — the session is over.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, signedOut);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, signedOut);
  }, [signedOut]);

  const login = useCallback(async (credentials: LoginRequest) => applySession(await authApi.login(credentials)), [applySession]);
  const register = useCallback(async (data: RegisterRequest) => applySession(await authApi.register(data)), [applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The local session is cleared regardless of what the server says.
    } finally {
      clearTokens();
      signedOut();
    }
  }, [signedOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
