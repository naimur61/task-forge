import { buildUrl, request, type RequestOptions } from '@/lib/http/request';
import { authFetch } from '@/auth/jwt/client';

export type ClientOptions = Omit<RequestOptions, 'method' | 'body'>;

/**
 * Minimal typed HTTP client for your backend. Paths resolve against
 * NEXT_PUBLIC_API_URL (or this app's origin when it's unset); failures throw
 * ApiError (see src/lib/http/api-error.ts).
 */
export function createApiClient(baseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? '') {
  const send = async <T>(method: NonNullable<RequestOptions['method']>, path: string, body?: unknown, options: ClientOptions = {}) => {
    const { params, ...rest } = options;
    const url = buildUrl(baseUrl, path, params);
    // Sends the session's credentials and refreshes an expired session once.
    return request<T>(url, { ...rest, method, body, fetcher: authFetch });
  };

  return {
    get: <T>(path: string, options?: ClientOptions) => send<T>('GET', path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: ClientOptions) => send<T>('POST', path, body, options),
    put: <T>(path: string, body?: unknown, options?: ClientOptions) => send<T>('PUT', path, body, options),
    patch: <T>(path: string, body?: unknown, options?: ClientOptions) => send<T>('PATCH', path, body, options),
    delete: <T = void>(path: string, options?: ClientOptions) => send<T>('DELETE', path, undefined, options),
  };
}

export const api = createApiClient();
export { ApiError } from '@/lib/http/api-error';
