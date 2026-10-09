'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

/** Renders the app's single <Toaster />, themed with the palette's CSS variables. */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: 'var(--radius)',
            background: 'hsl(var(--popover))',
            color: 'hsl(var(--popover-foreground))',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'hsl(var(--success))', secondary: '#fff' } },
          error: { iconTheme: { primary: 'hsl(var(--destructive))', secondary: '#fff' } },
        }}
      />
    </>
  );
}
