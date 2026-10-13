import { useAuthStore } from '@/store/zustand/auth';
import type { User } from '@/types/user';
import { buildUrl, request } from './request';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** Endpoints where a 401 means "wrong credentials", never "expired session". */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

/** Extra tries when the server is briefly unavailable (5xx or network error). */
const REFRESH_RETRIES = 2;
const REFRESH_RETRY_DELAY_MS = 800;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const urlOf = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

/** Ask the API for a new access token using the httpOnly refresh cookie. */
async function performRefresh(): Promise<boolean> {
  for (let attempt = 0; attempt <= REFRESH_RETRIES; attempt++) {
    try {
      const res = await fetch(buildUrl(API_URL, 'auth/refresh'), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { accessToken?: string };
        if (data.accessToken) useAuthStore.getState().setAccessToken(data.accessToken);
        return true;
      }
      if (res.status < 500) return false; // 4xx: the session is really invalid
    } catch {
      // Network error: treat it like a temporary server problem and retry.
    }
    if (attempt < REFRESH_RETRIES) await wait(REFRESH_RETRY_DELAY_MS);
  }
  return false;
}

let inFlight: Promise<boolean> | null = null;

/**
 * Refresh the session once, however many requests hit 401 at the same time.
 * The Web Locks API also serializes it across browser tabs; a tab that waited reuses the new token.
 */
export function refreshSession(): Promise<boolean> {
  if (inFlight) return inFlight;
  const tokenBefore = useAuthStore.getState().accessToken;
  const run = async () => {
    const current = useAuthStore.getState().accessToken;
    if (current && current !== tokenBefore) return true; // another tab already refreshed
    return performRefresh();
  };
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  // .then() flattens the lock's Promise<Promise<boolean>> type (runtime is already flat).
  const pending: Promise<boolean> = locks ? locks.request('auth-refresh', run).then((ok) => ok) : run();
  inFlight = pending.finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** `fetch` for API calls: adds the access token, and on 401 refreshes once and retries. Signs out if that fails. */
export const authFetch: typeof fetch = async (input, init = {}) => {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = useAuthStore.getState().accessToken;
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: 'include' });
  };

  const res = await send();
  const path = urlOf(input).split('?')[0];
  if (res.status !== 401 || NO_REFRESH_PATHS.some((p) => path.endsWith(p))) return res;

  if (await refreshSession()) {
    const retried = await send();
    if (retried.status !== 401) return retried;
  }
  useAuthStore.getState().clearSession();
  return res;
};

/** Load the signed-in user into the auth store. After a reload the token is gone, so the cookie is traded for a new one first. */
export async function loadSession(): Promise<User | null> {
  const store = useAuthStore.getState();
  if (!store.accessToken && !(await refreshSession())) {
    store.clearSession();
    return null;
  }
  try {
    const user = await request<User>(buildUrl(API_URL, 'auth/me'), { fetcher: authFetch });
    useAuthStore.getState().setSession(user);
    return user;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}
