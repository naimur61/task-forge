import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getErrorMessage, isApiError } from './api-error';
import type { ApiErrorBody } from '@/types/common';

/**
 * Show API validation errors on the matching form fields.
 * Returns a message for errors that don't belong to a field (show it as a banner), or null.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): string | null {
  const details = isApiError(error) ? (error.data as Partial<ApiErrorBody> | undefined)?.details : undefined;
  if (details?.length) {
    details.forEach((detail) => setError(detail.field as Path<T>, { type: 'server', message: detail.message }));
    return null;
  }
  return getErrorMessage(error);
}
