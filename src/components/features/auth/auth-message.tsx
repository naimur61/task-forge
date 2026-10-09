import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const toneClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  error: 'bg-destructive/10 text-destructive',
} as const;

interface AuthMessageProps {
  tone?: keyof typeof toneClasses;
  icon: ReactNode;
  title: string;
  message: string;
  /** Optional action below the message. */
  children?: ReactNode;
}

/** Full-page centered status message (email sent, link invalid, password updated…). */
export function AuthMessage({ tone = 'primary', icon, title, message, children }: AuthMessageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center" role="status">
        <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl', toneClasses[tone])}>{icon}</div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mb-6 text-muted-foreground">{message}</p>
        {children}
      </div>
    </main>
  );
}
