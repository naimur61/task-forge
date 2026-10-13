'use client';

import { useEffect, type ReactNode } from 'react';
import { loadSession } from '@/lib/http/auth-fetch';

/** Restores the session once when the app loads. Session state lives in the Zustand auth store. */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void loadSession();
  }, []);

  return children;
}
