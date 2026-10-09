'use client';

import { Sparkles } from 'lucide-react';

/** Seeded demo accounts (mock API only). */
const DEMO_ACCOUNTS = [
  { label: 'Owner', email: 'owner@demo.dev' },
  { label: 'Admin', email: 'admin@demo.dev' },
  { label: 'Member', email: 'member@demo.dev' },
];

export const DEMO_PASSWORD = 'Demo1234!';

/** Box with one-click demo logins. Only shown when the app runs on the demo API. */
export function DemoHint({ onPick }: { onPick: (email: string) => void }) {
  return (
    <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Try the demo
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">Pick an account to fill the form. Each role sees different controls.</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => onPick(account.email)}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-accent"
          >
            {account.label}
          </button>
        ))}
      </div>
    </div>
  );
}
