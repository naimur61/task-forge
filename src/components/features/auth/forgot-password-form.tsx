import type { UseFormReturn } from 'react-hook-form';
import { CustomField } from '@/components/common/fields/cus-input-field';
import { ActionButton } from '@/components/common/button';
import type { ForgotPasswordFormData } from '@/auth/jwt/validators';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';

interface ForgotPasswordFormProps {
  form: UseFormReturn<ForgotPasswordFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/** Pure "send me a reset link" form. State lives in forgot-password-container.tsx. */
export function ForgotPasswordForm({ form, onSubmit, isLoading, error }: ForgotPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Text form={form} name="email" type="email" autoComplete="email" labelName="Email" placeholder="name@example.com" required />
      <ActionButton type="submit" size="lg" fullWidth isPending={isLoading} loadingContent="Sending…">
        Send reset link
      </ActionButton>
    </form>
  );
}
