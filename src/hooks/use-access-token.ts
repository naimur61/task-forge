'use client';

import { useCallback } from 'react';
import { getAccessToken } from '@/auth/jwt/token-storage';

/**
 * Stable async getter for the current access token (null when the strategy
 * keeps tokens in HttpOnly cookies — those are sent automatically).
 */
export function useAccessTokenGetter(): () => Promise<string | null> {
  return useCallback(async () => getAccessToken(), []);
}
