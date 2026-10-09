import { authApi } from '@/auth/jwt/client';

/** API calls for the reset-password page (kept out of the container). */
export const resetPasswordService = {
  setNewPassword: (token: string, password: string) => authApi.resetPassword({ token, password }),
};
