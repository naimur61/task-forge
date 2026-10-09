/** Your backend's base URL. Auth endpoints below are resolved against it. */
export const AUTH_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** Backend contract — change the paths here if your API differs. */
export const AUTH_ENDPOINTS = {
  login: '/auth/login', // POST { email, password }        → AuthResponse
  register: '/auth/register', // POST { name, email, password } → AuthResponse
  logout: '/auth/logout', // POST
  refresh: '/auth/refresh', // POST                          → { accessToken?, refreshToken? }
  me: '/auth/me', // GET                           → User
  forgotPassword: '/auth/forgot-password', // POST { email }
  resetPassword: '/auth/reset-password', // POST { token, password }
  changePassword: '/auth/change-password', // POST { currentPassword, newPassword }
  profile: '/auth/profile', // PUT (update) · DELETE (delete account)
} as const;

/** Where signed-out users are sent, and where users land after signing in. */
export const LOGIN_PATH = '/login';
export const AFTER_LOGIN_PATH = '/dashboard';

/** Fired on window when the session can no longer be refreshed. */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

/**
 * Only allow same-site relative redirects (prevents open redirects via ?next=).
 */
export function safeRedirectPath(next: string | null | undefined, fallback: string = AFTER_LOGIN_PATH): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
