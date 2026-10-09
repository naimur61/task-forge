import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordContainer from './reset-password-container';

export const metadata: Metadata = { title: 'Choose a new password' };

// The container reads ?token= with useSearchParams, which needs a Suspense boundary.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContainer />
    </Suspense>
  );
}
