import { authApi } from '@/auth/jwt/client';

/** API calls for the forgot-password page (kept out of the container). */
export const forgotPasswordService = {
  requestResetLink: (email: string) => authApi.forgotPassword(email),
};
