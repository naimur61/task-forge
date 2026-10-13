import { create } from 'zustand';
import type { AuthStatus, User } from '@/auth/jwt/types';

interface AuthState {
  /** Short-lived JWT. Memory only, so it is gone after a reload (the refresh cookie brings it back). */
  accessToken: string | null;
  user: User | null;
  status: AuthStatus;
  /** True after the user chose to sign out, so the login page needs no `next` link back. */
  signedOutByUser: boolean;
  /** Save a new access token (after login or refresh). */
  setAccessToken: (accessToken: string) => void;
  /** Mark the user as signed in. */
  setSession: (user: User, accessToken?: string) => void;
  /** Replace the user data (after a profile update). */
  setUser: (user: User) => void;
  /** Clear everything and mark the user as signed out. */
  clearSession: (byUser?: boolean) => void;
}

/** The signed-in session. Read it in components with `useAuthStore`, outside React with `useAuthStore.getState()`. */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: 'loading',
  signedOutByUser: false,
  setAccessToken: (accessToken) => set({ accessToken }),
  setSession: (user, accessToken) =>
    set((state) => ({
      user,
      accessToken: accessToken ?? state.accessToken,
      status: 'authenticated',
      signedOutByUser: false,
    })),
  setUser: (user) => set({ user }),
  clearSession: (byUser = false) =>
    set({ accessToken: null, user: null, status: 'unauthenticated', signedOutByUser: byUser }),
}));
