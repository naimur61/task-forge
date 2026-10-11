'use client';

import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authFetch } from '@/auth/jwt/client';
import { buildUrl, request } from '@/lib/http/request';
import { getErrorMessage, type ApiError } from '@/lib/http/api-error';

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseApiMutationOptions<TData, TVars, TContext> {
  method: MutationMethod;
  /** Fixed path, or a function that builds it from the variables. */
  path: string | ((vars: TVars) => string);
  /** Build the request body from the variables. Default: send the variables as-is. */
  toBody?: (vars: TVars) => unknown;
  /** Cache keys to refetch after the request finishes. */
  invalidate?: QueryKey[];
  /** Toast shown on success. Leave empty for no toast. */
  successMessage?: string;
  /** Show the error as a toast. Turn off when the form shows it instead. */
  errorToast?: boolean;
  /** Runs before the request. Return a snapshot for rollback (optimistic updates). */
  onMutate?: (vars: TVars) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, vars: TVars) => void;
  /** Runs on failure. `context` is what onMutate returned. */
  onError?: (error: ApiError, vars: TVars, context: TContext | undefined) => void;
}

/** Create, update or delete data through the API (POST/PUT/PATCH/DELETE request). */
export function useApiMutation<TData = unknown, TVars = void, TContext = unknown>({
  method,
  path,
  toBody,
  invalidate = [],
  successMessage,
  errorToast = true,
  onMutate,
  onSuccess,
  onError,
}: UseApiMutationOptions<TData, TVars, TContext>) {
  const queryClient = useQueryClient();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  return useMutation<TData, ApiError, TVars, TContext>({
    mutationFn: (vars) => {
      const url = typeof path === 'function' ? path(vars) : path;
      // DELETE sends no body, every other verb sends `toBody(vars) ?? vars`.
      return request<TData>(buildUrl(baseUrl, url), {
        method,
        body: method === 'DELETE' ? undefined : toBody ? toBody(vars) : vars,
        fetcher: authFetch,
      });
    },
    onMutate,
    onSuccess: (data, vars) => {
      if (successMessage) toast.success(successMessage);
      onSuccess?.(data, vars);
    },
    onError: (error, vars, context) => {
      if (errorToast) toast.error(getErrorMessage(error));
      onError?.(error, vars, context);
    },
    onSettled: () => Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });
}
