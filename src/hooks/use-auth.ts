'use client';

import { useAuthStore } from '@/store/zustand/auth';

/** Current session from the Zustand auth store. */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const signedOutByUser = useAuthStore((state) => state.signedOutByUser);
  return { user, status, isAuthenticated: status === 'authenticated', signedOutByUser };
}
