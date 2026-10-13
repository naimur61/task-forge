'use client';

import { authApi, refreshSession } from '@/auth/jwt/client';
import type { LoginRequest, RegisterRequest, User } from '@/auth/jwt/types';
import { useAuthStore } from '@/store/zustand/auth';

/** Sign in and save the session in the auth store. */
async function login(credentials: LoginRequest): Promise<User> {
  const { user, accessToken } = await authApi.login(credentials);
  useAuthStore.getState().setSession(user, accessToken);
  return user;
}

/** Create an account and sign in. */
async function register(data: RegisterRequest): Promise<User> {
  const { user, accessToken } = await authApi.register(data);
  useAuthStore.getState().setSession(user, accessToken);
  return user;
}

/** Sign out on the server (best effort) and always clear the local session. */
async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // The local session is cleared whatever the server says.
  } finally {
    useAuthStore.getState().clearSession(true);
  }
}

/** Load the current user. After a reload the token is gone, so the refresh cookie is traded for a new one first. */
export async function refreshUser(): Promise<User | null> {
  const store = useAuthStore.getState();
  if (!store.accessToken && !(await refreshSession())) {
    store.clearSession();
    return null;
  }
  try {
    const me = await authApi.me();
    useAuthStore.getState().setSession(me);
    return me;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

/** Current session plus the auth actions. State comes from the Zustand auth store. */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const signedOutByUser = useAuthStore((state) => state.signedOutByUser);
  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    signedOutByUser,
    login,
    register,
    logout,
    refreshUser,
  };
}
