import { ApiError } from '@/lib/http/api-error';
import { buildUrl, request, type RequestOptions } from '@/lib/http/request';
import { useAuthStore } from '@/store/zustand/auth';
import { AUTH_API_URL, AUTH_ENDPOINTS } from './config';
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from './types';

/** Endpoints where a 401 means "wrong credentials", never "expired session". */
const NO_REFRESH = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.register,
  AUTH_ENDPOINTS.refresh,
  AUTH_ENDPOINTS.forgotPassword,
  AUTH_ENDPOINTS.resetPassword,
];

const urlOf = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

const isNoRefreshUrl = (url: string) => {
  const path = url.split('?')[0];
  return NO_REFRESH.some((endpoint) => path.endsWith(endpoint));
};

/** Extra tries when the server is briefly unavailable (5xx or network error). */
const REFRESH_RETRIES = 2;
const REFRESH_RETRY_DELAY_MS = 800;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function performRefresh(): Promise<boolean> {
  for (let attempt = 0; attempt <= REFRESH_RETRIES; attempt++) {
    try {
      const res = await fetch(buildUrl(AUTH_API_URL, AUTH_ENDPOINTS.refresh), {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as RefreshResponse;
        if (data.accessToken) useAuthStore.getState().setAccessToken(data.accessToken);
        return true;
      }
      if (res.status < 500) return false; // 4xx: the session is really invalid
    } catch {
      // Network error: treat like a temporary server problem and retry.
    }
    if (attempt < REFRESH_RETRIES) await wait(REFRESH_RETRY_DELAY_MS);
  }
  return false;
}

let inFlight: Promise<boolean> | null = null;

/**
 * Refresh the session once, however many requests hit 401 at the same time.
 * With the Web Locks API the refresh is also serialized across browser tabs,
 * and a tab that waited while another tab refreshed reuses the new token.
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
  const shared = pending.finally(() => {
    inFlight = null;
  });
  inFlight = shared;
  return shared;
}

/**
 * Drop-in `fetch` for calls to your API: attaches the access token (or sends
 * cookies), and on 401 refreshes the session once and retries the request.
 */
export const authFetch: typeof fetch = async (input, init = {}) => {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = useAuthStore.getState().accessToken;
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: 'include' });
  };

  const res = await send();
  if (res.status !== 401 || isNoRefreshUrl(urlOf(input))) return res;

  if (await refreshSession()) {
    const retried = await send();
    if (retried.status !== 401) return retried;
  }
  // The session can no longer be refreshed: sign the user out.
  useAuthStore.getState().clearSession();
  return res;
};

const call = <T>(path: string, options?: RequestOptions) =>
  request<T>(buildUrl(AUTH_API_URL, path), { ...options, fetcher: authFetch });

/** Typed calls for every endpoint in AUTH_ENDPOINTS. All throw ApiError on failure. */
export const authApi = {
  login: (body: LoginRequest) => call<AuthResponse>(AUTH_ENDPOINTS.login, { method: 'POST', body }),
  register: (body: RegisterRequest) => call<AuthResponse>(AUTH_ENDPOINTS.register, { method: 'POST', body }),
  logout: () => call<void>(AUTH_ENDPOINTS.logout, { method: 'POST' }),
  me: () => call<User>(AUTH_ENDPOINTS.me),
  forgotPassword: (email: string) => call<void>(AUTH_ENDPOINTS.forgotPassword, { method: 'POST', body: { email } }),
  resetPassword: (body: ResetPasswordRequest) => call<void>(AUTH_ENDPOINTS.resetPassword, { method: 'POST', body }),
  changePassword: (body: ChangePasswordRequest) => call<void>(AUTH_ENDPOINTS.changePassword, { method: 'POST', body }),
  updateProfile: (body: UpdateProfileRequest) => call<User>(AUTH_ENDPOINTS.profile, { method: 'PUT', body }),
  deleteAccount: () => call<void>(AUTH_ENDPOINTS.profile, { method: 'DELETE' }),
};

export { ApiError };
