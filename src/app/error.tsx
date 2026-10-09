'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ActionButton } from '@/components/common/button';

/** Shown when a page crashes. "Try again" re-renders the page. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">An unexpected error happened. You can try again, or go back to the dashboard.</p>
      <div className="flex gap-2">
        <ActionButton handleOpen={reset}>Try again</ActionButton>
        <ActionButton variant="outline" handleOpen={() => window.location.assign('/dashboard')}>
          Dashboard
        </ActionButton>
      </div>
    </main>
  );
}
