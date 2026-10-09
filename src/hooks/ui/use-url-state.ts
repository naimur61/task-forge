'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type UrlValue = string | number | boolean | string[] | null | undefined;

/**
 * Read and write query-string values (filters, sort, page, open task).
 * The URL is the single source of truth, so pages are shareable and the back button works.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** One value, e.g. `get('search')`. */
  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);

  /** All values of a repeated key, e.g. `getAll('status')`. */
  const getAll = useCallback((key: string) => searchParams.getAll(key), [searchParams]);

  /** Change some keys and keep the rest. Empty values remove the key. */
  const set = useCallback(
    (changes: Record<string, UrlValue>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        params.delete(key);
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
        else if (value !== undefined && value !== null && value !== '' && value !== false) params.set(key, String(value));
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  /** Remove the given keys. */
  const clear = useCallback(
    (keys: string[]) => set(Object.fromEntries(keys.map((key) => [key, undefined]))),
    [set],
  );

  return { get, getAll, set, clear };
}
