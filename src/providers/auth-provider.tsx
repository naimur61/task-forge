'use client';

import { useEffect, type ReactNode } from 'react';
import { refreshUser } from '@/hooks/use-auth';

/** Restores the session once when the app loads. Session state itself lives in the Zustand auth store. */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void refreshUser();
  }, []);

  return children;
}
