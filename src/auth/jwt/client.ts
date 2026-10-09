import { ApiError } from '@/lib/http/api-error';
import { buildUrl, request, type RequestOptions } from '@/lib/http/request';
import { AUTH_API_URL, AUTH_ENDPOINTS, SESSION_EXPIRED_EVENT } from './config';
import {
  USES_COOKIES,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './token-storage';
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
const NO_REFRESH = [AUTH_ENDPOINTS.login, AUTH_ENDPOINTS.register, AUTH_ENDPOINTS.refresh, AUTH_ENDPOINTS.forgotPassword, AUTH_ENDPOINTS.resetPassword];

const urlOf = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

const isNoRefreshUrl = (url: string) => {
  const path = url.split('?')[0];
  return NO_REFRESH.some((endpoint) => path.endsWith(endpoint));
};

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!USES_COOKIES && !refreshToken) return false;
  try {
    const res = await fetch(buildUrl(AUTH_API_URL, AUTH_ENDPOINTS.refresh), {
      method: 'POST',
      headers: { Accept: 'application/json', ...(refreshToken ? { 'Content-Type': 'application/json' } : {}) },
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      credentials: USES_COOKIES ? 'include' : 'same-origin',
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => ({}))) as RefreshResponse;
    setTokens(data);
    return true;
  } catch {
    return false;
  }
}

let inFlight: Promise<boolean> | null = null;

/**
 * Refresh the session once, however many requests hit 401 at the same time.
 * With the Web Locks API the refresh is also serialized across browser tabs,
 * and a tab that waited while another tab refreshed reuses the new token.
 */
export function refreshSession(): Promise<boolean> {
  if (inFlight) return inFlight;
  const tokenBefore = getAccessToken();
  const run = async () => {
    const current = getAccessToken();
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

function notifySessionExpired() {
  clearTokens();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

/**
 * Drop-in `fetch` for calls to your API: attaches the access token (or sends
 * cookies), and on 401 refreshes the session once and retries the request.
 */
export const authFetch: typeof fetch = async (input, init = {}) => {
  const send = () => {
    const headers = new Headers(init.headers);
    const token = getAccessToken();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers, credentials: USES_COOKIES ? 'include' : init.credentials });
  };

  const res = await send();
  if (res.status !== 401 || isNoRefreshUrl(urlOf(input))) return res;

  if (await refreshSession()) {
    const retried = await send();
    if (retried.status !== 401) return retried;
  }
  notifySessionExpired();
  return res;
};

const call = <T>(path: string, options?: RequestOptions) =>
  request<T>(buildUrl(AUTH_API_URL, path), { ...options, fetcher: authFetch });

/** Typed calls for every endpoint in AUTH_ENDPOINTS. All throw ApiError on failure. */
export const authApi = {
  login: (body: LoginRequest) => call<AuthResponse>(AUTH_ENDPOINTS.login, { method: 'POST', body }),
  register: (body: RegisterRequest) => call<AuthResponse>(AUTH_ENDPOINTS.register, { method: 'POST', body }),
  logout: () => {
    const refreshToken = getRefreshToken();
    return call<void>(AUTH_ENDPOINTS.logout, { method: 'POST', body: refreshToken ? { refreshToken } : undefined });
  },
  me: () => call<User>(AUTH_ENDPOINTS.me),
  forgotPassword: (email: string) => call<void>(AUTH_ENDPOINTS.forgotPassword, { method: 'POST', body: { email } }),
  resetPassword: (body: ResetPasswordRequest) => call<void>(AUTH_ENDPOINTS.resetPassword, { method: 'POST', body }),
  changePassword: (body: ChangePasswordRequest) => call<void>(AUTH_ENDPOINTS.changePassword, { method: 'POST', body }),
  updateProfile: (body: UpdateProfileRequest) => call<User>(AUTH_ENDPOINTS.profile, { method: 'PUT', body }),
  deleteAccount: () => call<void>(AUTH_ENDPOINTS.profile, { method: 'DELETE' }),
};

export { ApiError };
