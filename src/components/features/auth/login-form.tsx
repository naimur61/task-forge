import Link from 'next/link';
import type { UseFormReturn } from 'react-hook-form';
import { CustomField } from '@/components/common/fields/cus-input-field';
import { ActionButton } from '@/components/common/button';
import type { LoginFormData } from '@/auth/jwt/validators';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';

interface LoginFormProps {
  form: UseFormReturn<LoginFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/** Pure login form. State lives in login-container.tsx. */
export function LoginForm({ form, onSubmit, isLoading, error }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Text form={form} name="email" type="email" autoComplete="email" labelName="Email" placeholder="name@example.com" required />
      <CustomField.Password form={form} name="password" autoComplete="current-password" labelName="Password" placeholder="Your password" required />
      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <ActionButton type="submit" size="lg" fullWidth isPending={isLoading} loadingContent="Signing in…">
        Sign in
      </ActionButton>
    </form>
  );
}
