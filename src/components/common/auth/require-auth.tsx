'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LOGIN_PATH } from '@/config/navigation';

interface RequireAuthProps {
  children: ReactNode;
  /** Shown while the session is being restored. */
  fallback?: ReactNode;
}

/**
 * Client-side route guard: renders children only for signed-in users and
 * sends everyone else to the login page (returning here afterwards).
 *
 * @example
 * export default function AccountPage() {
 *   return <RequireAuth><AccountContainer /></RequireAuth>;
 * }
 */
export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { status, signedOutByUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    // After an explicit sign-out go to plain /login; otherwise come back to this page after signing in.
    router.replace(signedOutByUser ? LOGIN_PATH : `${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
  }, [status, signedOutByUser, router, pathname]);

  return status === 'authenticated' ? <>{children}</> : <>{fallback}</>;
}
