import type { ReactNode } from 'react';

interface AuthCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Rendered below the card, e.g. a "Sign in" link. */
  footer?: ReactNode;
}

/** Shared auth page shell: icon header + form card. Pure UI — state lives in the *-container.tsx. */
export function AuthCard({ icon, title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">{icon}</div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">{children}</div>
        {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </main>
  );
}
