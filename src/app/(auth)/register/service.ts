import { useApiMutation } from '@/hooks/api-hooks';
import { useAuthStore } from '@/store/zustand/auth';
import type { User } from '@/types/user';

/** Create an account and sign in. */
export const useRegister = () =>
  useApiMutation<{ user: User; accessToken?: string }, { name: string; email: string; password: string }>({
    method: 'POST',
    path: 'auth/register',
    errorToast: false,
    onSuccess: ({ user, accessToken }) => useAuthStore.getState().setSession(user, accessToken),
  });
