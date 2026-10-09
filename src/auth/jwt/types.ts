export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * What /auth/login and /auth/register return. Cookie strategies may omit the
 * tokens (they arrive as HttpOnly cookies instead).
 */
export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
