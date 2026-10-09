import type { UseFormReturn } from 'react-hook-form';
import { CustomField } from '@/components/common/fields/cus-input-field';
import { ActionButton } from '@/components/common/button';
import type { RegisterFormData } from '@/auth/jwt/validators';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/** Pure registration form. State lives in register-container.tsx. */
export function RegisterForm({ form, onSubmit, isLoading, error }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Text form={form} name="name" autoComplete="name" labelName="Full name" placeholder="Jane Doe" required />
      <CustomField.Text form={form} name="email" type="email" autoComplete="email" labelName="Email" placeholder="name@example.com" required />
      <CustomField.Password form={form} name="password" autoComplete="new-password" labelName="Password" placeholder="At least 8 characters" required />
      <CustomField.Password form={form} name="confirmPassword" autoComplete="new-password" labelName="Confirm password" placeholder="Repeat your password" required />
      <ActionButton type="submit" size="lg" fullWidth isPending={isLoading} loadingContent="Creating account…">
        Create account
      </ActionButton>
    </form>
  );
}
