import { useApiMutation } from '@/hooks/api-hooks';
import { useAuthStore } from '@/store/zustand/auth';
import type { User } from '@/types/user';

/** Save my profile (name) and update the signed-in user in the auth store. */
export const useUpdateProfile = (onDone: () => void) =>
  useApiMutation<User, { name: string }>({
    method: 'PUT',
    path: 'auth/profile',
    successMessage: 'Profile saved',
    errorToast: false,
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
      onDone();
    },
  });

/** Change my password. */
export const useChangePassword = (onDone: () => void) =>
  useApiMutation<void, { currentPassword: string; newPassword: string }>({
    method: 'POST',
    path: 'auth/change-password',
    successMessage: 'Password changed',
    errorToast: false,
    onSuccess: onDone,
  });
