'use client';

import { keepPreviousData as keepPrevious, useQuery, type QueryKey } from '@tanstack/react-query';
import { authFetch } from '@/auth/jwt/client';
import { buildUrl, request, type QueryParams } from '@/lib/http/request';

interface UseFetchDataOptions {
  /** API path, e.g. `projects/${id}/tasks`. Resolved against NEXT_PUBLIC_API_URL. */
  path: string;
  /** Cache key. Put every value the request depends on in here. */
  queryKey: QueryKey;
  /** Query string values. Empty values are skipped. */
  filterData?: QueryParams;
  /** Set false to wait (e.g. until an id is known). */
  enabled?: boolean;
  /** Keep showing the old page while the next page loads. */
  keepPreviousData?: boolean;
}

/** Load data from the API with caching (GET request). */
export function useFetchData<T>({
  path,
  queryKey,
  filterData,
  enabled = true,
  keepPreviousData = false,
}: UseFetchDataOptions) {
  return useQuery<T>({
    queryKey,
    queryFn: ({ signal }) =>
      request<T>(buildUrl(process.env.NEXT_PUBLIC_API_URL ?? '', path), {
        method: 'GET',
        params: filterData,
        signal,
        fetcher: authFetch,
      }),
    enabled,
    placeholderData: keepPreviousData ? keepPrevious : undefined,
  });
}
