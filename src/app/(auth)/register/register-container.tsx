'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { getErrorMessage } from '@/lib/http/api-error';
import { useAuth } from '@/hooks/use-auth';
import { AFTER_LOGIN_PATH } from '@/auth/jwt/config';
import { registerSchema } from '@/auth/jwt/validators';
import { AuthCard } from '@/components/features/auth/auth-card';
import { RegisterForm } from '@/components/features/auth/register-form';

export default function RegisterContainer() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useZodForm(registerSchema, {
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async ({ name, email, password }) => {
    setError(null);
    try {
      await register({ name, email, password });
      router.replace(AFTER_LOGIN_PATH);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <AuthCard
      icon={<UserPlus className="h-6 w-6 text-primary" aria-hidden />}
      title="Create an account"
      subtitle="It only takes a minute"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm form={form} onSubmit={onSubmit} isLoading={form.formState.isSubmitting} error={error} />
    </AuthCard>
  );
}
