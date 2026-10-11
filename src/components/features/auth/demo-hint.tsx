'use client';

import { Sparkles } from 'lucide-react';

/** Shared password for every seeded demo account. */
export const DEMO_PASSWORD = 'Demo1234!';

/** Primary accounts: one per role (OWNER / ADMIN / MEMBER). */
const ROLE_ACCOUNTS = [
  { label: 'Ava · Owner', email: 'owner@demo.dev' },
  { label: 'Marcus · Admin', email: 'admin@demo.dev' },
  { label: 'Priya · Member', email: 'member@demo.dev' },
];

/** Extra developers who appear as MEMBERs in the demo data. */
const DEV_ACCOUNTS = [
  { label: 'Diego', email: 'diego@demo.dev' },
  { label: 'Sara', email: 'sara@demo.dev' },
  { label: 'Liam', email: 'liam@demo.dev' },
];

/** One-click demo login box. */
export function DemoHint({ onPick }: { onPick: (email: string) => void }) {
  return (
    <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Demo accounts
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        One click fills the form. Password for every account is <code className="font-mono">{DEMO_PASSWORD}</code>.
      </p>

      <div className="mt-3 space-y-2.5">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Roles</p>
          <div className="flex flex-wrap gap-2">
            {ROLE_ACCOUNTS.map((account) => (
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

        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">More members</p>
          <div className="flex flex-wrap gap-2">
            {DEV_ACCOUNTS.map((account) => (
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
      </div>
    </div>
  );
}
