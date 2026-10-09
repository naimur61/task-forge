import { ApiError } from './api-error';

export type QueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number | boolean>;
export type QueryParams = Record<string, QueryValue>;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResponseType = 'json' | 'text' | 'blob' | 'arraybuffer';

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod;
  /** Appended to the URL; null / undefined / '' values are skipped, arrays repeat the key. */
  params?: QueryParams;
  /** Plain objects/arrays are sent as JSON. FormData, Blob, URLSearchParams and strings are sent as-is. */
  body?: unknown;
  /** Sent as `Authorization: Bearer <token>` when present. */
  token?: string | null;
  /** How to read a successful response (default: JSON, falling back to text). */
  responseType?: ResponseType;
  /** Abort after this many ms (default 30 s). 0 disables the timeout. */
  timeoutMs?: number;
  /** fetch implementation — e.g. an auth-aware fetch that refreshes expired tokens. */
  fetcher?: typeof fetch;
  /** Next.js data-cache options (server only). */
  next?: { revalidate?: number | false; tags?: string[] };
}

/** Append query params to a URL; null / undefined / '' values are skipped, arrays repeat the key. */
export function appendParams(url: string, params?: QueryParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)));
    else search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

/**
 * Join a base URL and a path. Absolute `path`s are used as-is; an empty base
 * means same-origin (e.g. your own /api route handlers).
 */
export function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  return appendParams(url, params);
}

const isRawBody = (body: unknown): body is BodyInit =>
  typeof body === 'string' ||
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  body instanceof ArrayBuffer ||
  ArrayBuffer.isView(body) ||
  (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream);

async function readBody(res: Response, responseType: ResponseType): Promise<unknown> {
  if (res.status === 204 || res.status === 205 || res.headers.get('content-length') === '0') return undefined;
  if (res.ok && responseType === 'blob') return res.blob();
  if (res.ok && responseType === 'arraybuffer') return res.arrayBuffer();
  const text = await res.text();
  if (!text) return undefined;
  if (res.ok && responseType === 'text') return text;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('json') || /^[[{]/.test(text.trimStart())) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/** Combine the caller's AbortSignal with a timeout (works on every supported runtime). */
function withTimeout(signal: AbortSignal | null | undefined, timeoutMs: number) {
  if (!timeoutMs) return { signal: signal ?? undefined, timedOut: () => false, clear: () => {} };
  const controller = new AbortController();
  let didTimeOut = false;
  const timer = setTimeout(() => {
    didTimeOut = true;
    controller.abort();
  }, timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) controller.abort(signal.reason);
  else signal?.addEventListener('abort', onAbort, { once: true });
  return {
    signal: controller.signal,
    timedOut: () => didTimeOut,
    clear: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

/**
 * fetch with sane defaults: JSON in/out, typed errors, timeouts, cancellation.
 * Throws `ApiError` for non-2xx responses and network failures; rethrows
 * AbortError untouched so React Query can treat it as a cancellation.
 */
export async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    params,
    body,
    token,
    responseType = 'json',
    timeoutMs = 30_000,
    fetcher = fetch,
    headers: initHeaders,
    signal: callerSignal,
    ...init
  } = options;

  const finalUrl = appendParams(url, params);
  const headers = new Headers(initHeaders);
  if (!headers.has('Accept') && responseType === 'json') headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (isRawBody(body)) {
      payload = body;
    } else {
      payload = JSON.stringify(body);
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    }
  }

  const timeout = withTimeout(callerSignal, timeoutMs);
  let res: Response;
  try {
    res = await fetcher(finalUrl, { ...init, method, headers, body: payload, signal: timeout.signal });
  } catch (error) {
    timeout.clear();
    if (timeout.timedOut()) {
      throw new ApiError(`Request timed out after ${Math.round(timeoutMs / 1000)}s`, { status: 0, url: finalUrl, cause: error });
    }
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error — check your connection and try again.', { status: 0, url: finalUrl, cause: error });
  }

  try {
    const data = await readBody(res, responseType);
    if (!res.ok) {
      throw new ApiError(`${method} ${finalUrl} failed with ${res.status}`, { status: res.status, data, url: finalUrl });
    }
    return data as T;
  } finally {
    timeout.clear();
  }
}
