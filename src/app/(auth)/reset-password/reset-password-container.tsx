'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck, KeyRound, TriangleAlert } from 'lucide-react';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { getErrorMessage } from '@/lib/http/api-error';
import { LOGIN_PATH } from '@/auth/jwt/config';
import { resetPasswordSchema } from '@/auth/jwt/validators';
import { AuthCard } from '@/components/features/auth/auth-card';
import { AuthMessage } from '@/components/features/auth/auth-message';
import { ResetPasswordForm } from '@/components/features/auth/reset-password-form';
import { resetPasswordService } from './service';

const REDIRECT_DELAY_MS = 3000;

export default function ResetPasswordContainer() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useZodForm(resetPasswordSchema, { defaultValues: { password: '', confirmPassword: '' } });

  // After success, continue to sign-in (timer cleared if the user navigates away first).
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push(LOGIN_PATH), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [done, router]);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token) return;
    setError(null);
    try {
      await resetPasswordService.setNewPassword(token, password);
      setDone(true);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  if (!token) {
    return (
      <AuthMessage
        tone="error"
        icon={<TriangleAlert className="h-6 w-6" aria-hidden />}
        title="Invalid reset link"
        message="This link is missing its reset token. Request a new one below."
      >
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Request a new link
        </Link>
      </AuthMessage>
    );
  }

  if (done) {
    return (
      <AuthMessage
        tone="success"
        icon={<CircleCheck className="h-6 w-6" aria-hidden />}
        title="Password updated"
        message="You can now sign in with your new password. Redirecting…"
      >
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Sign in now
        </Link>
      </AuthMessage>
    );
  }

  return (
    <AuthCard
      icon={<KeyRound className="h-6 w-6 text-primary" aria-hidden />}
      title="Choose a new password"
      subtitle="Use at least 8 characters with a letter and a number"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm form={form} onSubmit={onSubmit} isLoading={form.formState.isSubmitting} error={error} />
    </AuthCard>
  );
}
