/**
 * Strategy: access token in memory + refresh token in an HttpOnly cookie.
 *
 * The short-lived access token only ever lives in this module's memory, so
 * it disappears on reload; the AuthProvider then calls /auth/refresh (the
 * browser sends the HttpOnly refresh cookie) to get a new one. XSS cannot
 * read the refresh token.
 *
 * Backend checklist: /auth/login and /auth/refresh return { accessToken }
 * in the body and set the refresh token as an HttpOnly cookie; CORS allows
 * credentials for this origin.
 */

export const TOKEN_STRATEGY = 'memory-cookie';
export const USES_COOKIES = true;

let accessToken: string | null = null;
const listeners = new Set<() => void>();

export const getAccessToken = (): string | null => accessToken;
/** The refresh token is an HttpOnly cookie, invisible to JavaScript. */
export const getRefreshToken = (): string | null => null;

export const setTokens = (tokens: { accessToken?: string; refreshToken?: string }): void => {
  if (tokens.accessToken) {
    accessToken = tokens.accessToken;
    listeners.forEach((l) => l());
  }
};

export const clearTokens = (): void => {
  accessToken = null;
  listeners.forEach((l) => l());
};

export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
