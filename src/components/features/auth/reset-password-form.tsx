import type { UseFormReturn } from 'react-hook-form';
import { CustomField } from '@/components/common/fields/cus-input-field';
import { ActionButton } from '@/components/common/button';
import type { ResetPasswordFormData } from '@/auth/jwt/validators';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';

interface ResetPasswordFormProps {
  form: UseFormReturn<ResetPasswordFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/** Pure "choose a new password" form. State lives in reset-password-container.tsx. */
export function ResetPasswordForm({ form, onSubmit, isLoading, error }: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Password form={form} name="password" autoComplete="new-password" labelName="New password" placeholder="At least 8 characters" required />
      <CustomField.Password form={form} name="confirmPassword" autoComplete="new-password" labelName="Confirm new password" placeholder="Repeat your password" required />
      <ActionButton type="submit" size="lg" fullWidth isPending={isLoading} loadingContent="Saving…">
        Update password
      </ActionButton>
    </form>
  );
}
