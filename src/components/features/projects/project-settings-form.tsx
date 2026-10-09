'use client';

import type { UseFormReturn } from 'react-hook-form';
import { ActionButton } from '@/components/common/button';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';
import { CustomField } from '@/components/common/fields/cus-input-field';
import type { ProjectFormData } from '@/components/common/forms/schemas/project';

interface ProjectSettingsFormProps {
  form: UseFormReturn<ProjectFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

/** "General" card: project name and description. */
export function ProjectSettingsForm({ form, onSubmit, isPending, error }: ProjectSettingsFormProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-semibold text-foreground">General</h2>
      <p className="mt-1 text-sm text-muted-foreground">Name and description shown to everyone in the project.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <ErrorAlert error={error} />
        <CustomField.Text form={form} name="name" labelName="Name" required disableLabelFormatting />
        <CustomField.TextArea form={form} name="description" labelName="Description" rows={4} disableLabelFormatting />
        <div className="flex justify-end">
          <ActionButton type="submit" isPending={isPending} disabled={!form.formState.isDirty} loadingContent="Saving…">
            Save changes
          </ActionButton>
        </div>
      </form>
    </section>
  );
}
