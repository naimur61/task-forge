import { useApiMutation } from '@/hooks/api-hooks';
import { useAuthStore } from '@/store/zustand/auth';
import type { User } from '@/types/user';

/** Sign in and save the session in the auth store. */
export const useLogin = () =>
  useApiMutation<{ user: User; accessToken?: string }, { email: string; password: string }>({
    method: 'POST',
    path: 'auth/login',
    errorToast: false,
    onSuccess: ({ user, accessToken }) => useAuthStore.getState().setSession(user, accessToken),
  });
