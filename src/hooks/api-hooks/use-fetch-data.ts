'use client';

import { keepPreviousData as keepPrevious, useQuery, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/fetch/client';
import type { QueryParams } from '@/lib/http/request';

interface UseFetchDataOptions {
  /** API path, e.g. `projects/${id}/tasks`. */
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
    queryFn: ({ signal }) => api.get<T>(path, { params: filterData, signal }),
    enabled,
    placeholderData: keepPreviousData ? keepPrevious : undefined,
  });
}
