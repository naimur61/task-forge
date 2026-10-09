'use client';

import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ActionButton } from '@/components/common/button';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';
import { CustomField } from '@/components/common/fields/cus-input-field';
import type { ChangePasswordFormData, ProfileFormData } from '@/components/common/forms/schemas/account';

/** Card frame for one settings section. */
export function SettingsCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

interface FormProps<T extends ProfileFormData | ChangePasswordFormData> {
  form: UseFormReturn<T>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

/** Name field. The email is shown read-only. */
export function ProfileForm({ form, onSubmit, isPending, error, email }: FormProps<ProfileFormData> & { email: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Text form={form} name="name" labelName="Name" required autoComplete="name" disableLabelFormatting />
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Email</p>
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="flex justify-end">
        <ActionButton type="submit" isPending={isPending} disabled={!form.formState.isDirty} loadingContent="Saving…">
          Save profile
        </ActionButton>
      </div>
    </form>
  );
}

/** Current + new password fields. */
export function PasswordForm({ form, onSubmit, isPending, error }: FormProps<ChangePasswordFormData>) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <ErrorAlert error={error} />
      <CustomField.Password form={form} name="currentPassword" labelName="Current password" autoComplete="current-password" required disableLabelFormatting />
      <CustomField.Password form={form} name="newPassword" labelName="New password" autoComplete="new-password" required disableLabelFormatting />
      <CustomField.Password form={form} name="confirmPassword" labelName="Confirm new password" autoComplete="new-password" required disableLabelFormatting />
      <div className="flex justify-end">
        <ActionButton type="submit" isPending={isPending} loadingContent="Updating…">
          Change password
        </ActionButton>
      </div>
    </form>
  );
}
