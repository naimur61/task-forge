'use client';

import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/common/auth/require-auth';
import { ActionButton } from '@/components/common/button';
import { useAuth } from '@/hooks/use-auth';
import { LOGIN_PATH } from '@/auth/jwt/config';

/** Example protected page: only signed-in users get here. */
export default function AccountContainer() {
  return (
    <RequireAuth fallback={<p className="text-sm text-muted-foreground">Loading your account…</p>}>
      <AccountDetails />
    </RequireAuth>
  );
}

function AccountDetails() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">Signed in with your API session.</p>
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border bg-card text-sm">
        <div className="flex justify-between gap-4 p-4">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-medium text-foreground">{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 p-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-medium text-foreground">{user.email}</dd>
        </div>
      </dl>
      <ActionButton
        variant="outline"
        handleOpen={async () => {
          await logout();
          router.replace(LOGIN_PATH);
        }}
      >
        Sign out
      </ActionButton>
    </section>
  );
}
