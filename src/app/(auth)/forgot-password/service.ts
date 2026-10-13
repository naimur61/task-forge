import { useApiMutation } from '@/hooks/api-hooks';

/** Email me a password reset link. */
export const useForgotPassword = () =>
  useApiMutation<void, { email: string }>({ method: 'POST', path: 'auth/forgot-password', errorToast: false });
