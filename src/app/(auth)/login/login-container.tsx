'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { getErrorMessage, isApiError } from '@/lib/http/api-error';
import { useAuth } from '@/hooks/use-auth';
import { safeRedirectPath } from '@/auth/jwt/config';
import { loginSchema } from '@/auth/jwt/validators';
import { AuthCard } from '@/components/features/auth/auth-card';
import { LoginForm } from '@/components/features/auth/login-form';
import { DEMO_PASSWORD, DemoHint } from '@/components/features/auth/demo-hint';
import { IS_DEMO_API } from '@/config/site';

export default function LoginContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const redirectTo = safeRedirectPath(searchParams.get('next'));

  const form = useZodForm(loginSchema, { defaultValues: { email: '', password: '' } });

  // Already signed in (e.g. opened /login in a new tab) → continue.
  useEffect(() => {
    if (status === 'authenticated') router.replace(redirectTo);
  }, [status, router, redirectTo]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      router.replace(redirectTo);
    } catch (e) {
      setError(isApiError(e) && e.status === 401 ? 'Incorrect email or password.' : getErrorMessage(e));
    }
  });

  return (
    <AuthCard
      icon={<LogIn className="h-6 w-6 text-primary" aria-hidden />}
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {IS_DEMO_API && (
        <DemoHint
          onPick={(email) => {
            form.setValue('email', email, { shouldValidate: true });
            form.setValue('password', DEMO_PASSWORD, { shouldValidate: true });
          }}
        />
      )}
      <LoginForm form={form} onSubmit={onSubmit} isLoading={form.formState.isSubmitting} error={error} />
    </AuthCard>
  );
}
