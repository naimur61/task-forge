'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, MailCheck } from 'lucide-react';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { getErrorMessage } from '@/lib/http/api-error';
import { forgotPasswordSchema } from '@/auth/jwt/validators';
import { AuthCard } from '@/components/features/auth/auth-card';
import { AuthMessage } from '@/components/features/auth/auth-message';
import { ForgotPasswordForm } from '@/components/features/auth/forgot-password-form';
import { forgotPasswordService } from './service';

export default function ForgotPasswordContainer() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useZodForm(forgotPasswordSchema, { defaultValues: { email: '' } });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null);
    try {
      await forgotPasswordService.requestResetLink(email);
      setSentTo(email);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  if (sentTo) {
    return (
      <AuthMessage
        tone="success"
        icon={<MailCheck className="h-6 w-6" aria-hidden />}
        title="Check your email"
        message={`If an account exists for ${sentTo}, we've sent a link to reset your password.`}
      >
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to sign in
        </Link>
      </AuthMessage>
    );
  }

  return (
    <AuthCard
      icon={<KeyRound className="h-6 w-6 text-primary" aria-hidden />}
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm form={form} onSubmit={onSubmit} isLoading={form.formState.isSubmitting} error={error} />
    </AuthCard>
  );
}
