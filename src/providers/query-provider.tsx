'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid an immediate refetch after hydration.
        staleTime: 60 * 1000,
        // Retry network failures and 5xx; never retry 4xx (auth, validation, not found).
        retry: (failureCount, error) => {
          const status = (error as { status?: number } | null)?.status;
          if (typeof status === 'number' && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

/** One client per request on the server, one shared client in the browser. */
export const getQueryClient = () => {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
