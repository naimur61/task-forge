'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LOGIN_PATH } from '@/auth/jwt/config';

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
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  return status === 'authenticated' ? <>{children}</> : <>{fallback}</>;
}
