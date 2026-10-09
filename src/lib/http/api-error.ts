/**
 * The one error type every API call in this project throws.
 *
 * `status` is the HTTP status, or 0 when the request never got a response
 * (offline, DNS, CORS, timeout). `data` is the parsed response body.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly url: string;

  constructor(message: string, init: { status: number; data?: unknown; url: string; cause?: unknown }) {
    super(message, { cause: init.cause });
    this.name = 'ApiError';
    this.status = init.status;
    this.data = init.data;
    this.url = init.url;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/**
 * Best human-readable message for an error from any API call.
 * Looks at common backend shapes: { message }, { error }, { errors: [...] }.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) {
    const data = error.data;
    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      for (const key of ['message', 'error', 'detail', 'title']) {
        const value = body[key];
        if (typeof value === 'string' && value.trim()) return value;
        if (Array.isArray(value) && value.length) return value.map(String).join(', ');
      }
      if (Array.isArray(body.errors) && body.errors.length) {
        return body.errors
          .map((e) => (typeof e === 'string' ? e : (e as { message?: string })?.message))
          .filter(Boolean)
          .join(', ');
      }
    }
    if (typeof data === 'string' && data.trim() && data.length < 300 && !data.trimStart().startsWith('<')) return data;
    if (error.isNetworkError) return error.message || 'Network error — check your connection and try again.';
    if (error.status === 401) return 'Your session has expired. Please sign in again.';
    if (error.status === 403) return "You don't have permission to do that.";
    if (error.status === 404) return 'Not found.';
    if (error.status >= 500) return 'The server ran into a problem. Please try again shortly.';
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
