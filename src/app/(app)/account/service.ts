import { useApiMutation } from '@/hooks/api-hooks';
import type { ChangePasswordRequest, UpdateProfileRequest, User } from '@/auth/jwt/types';

/** Save my profile (name). */
export const useUpdateProfile = (onDone: () => void) =>
  useApiMutation<User, UpdateProfileRequest>({
    method: 'PUT',
    path: 'auth/profile',
    successMessage: 'Profile saved',
    errorToast: false,
    onSuccess: onDone,
  });

/** Change my password. */
export const useChangePassword = (onDone: () => void) =>
  useApiMutation<void, ChangePasswordRequest>({
    method: 'POST',
    path: 'auth/change-password',
    successMessage: 'Password changed',
    errorToast: false,
    onSuccess: onDone,
  });
