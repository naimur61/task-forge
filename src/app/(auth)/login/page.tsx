import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginContainer from './login-container';

export const metadata: Metadata = { title: 'Sign in' };

// The container reads ?next= with useSearchParams, which needs a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContainer />
    </Suspense>
  );
}
