import { useApiMutation } from '@/hooks/api-hooks';

/** Set a new password with the token from the email link. */
export const useResetPassword = () =>
  useApiMutation<void, { token: string; password: string }>({
    method: 'POST',
    path: 'auth/reset-password',
    errorToast: false,
  });
