'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { LayoutProvider } from '@/providers/layout-provider';
import { ToastProvider } from '@/providers/toast-provider';

/**
 * App-wide providers, composed by Nexstruct for the options you selected.
 * Order matters — outer providers are available to everything inside them.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <LayoutProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LayoutProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
