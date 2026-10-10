'use client';

import type { UseFormReturn } from 'react-hook-form';
import { ActionButton } from '@/components/common/button';
import { CustomField } from '@/components/common/fields/cus-input-field';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/custom/dialog';
import type { ProjectFormData } from '@/components/common/forms/schemas/project';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<ProjectFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  /** Error that is not about a single field. */
  error: string | null;
}

/** Dialog with the project name + description form. State lives in the container. */
export function ProjectFormDialog({ open, onOpenChange, mode, form, onSubmit, isPending, error }: ProjectFormDialogProps) {
  const isCreate = mode === 'create';

  // Ask before throwing away typed changes.
  // Read isDirty during render: react-hook-form only tracks form state that is read here.
  const { isDirty } = form.formState;
  const handleOpenChange = (next: boolean) => {
    if (!next && isDirty && !isPending && !window.confirm('Discard your changes?')) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? 'New project' : 'Edit project'}</DialogTitle>
          <DialogDescription>
            {isCreate ? 'You will be the owner. You can invite teammates next.' : 'Update the name and description.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <ErrorAlert error={error} />
          <CustomField.Text form={form} name="name" labelName="Name" placeholder="e.g. Website redesign" required disableLabelFormatting />
          <CustomField.TextArea
            form={form}
            name="description"
            labelName="Description"
            placeholder="What is this project about?"
            rows={4}
            disableLabelFormatting
          />
          <DialogFooter className="gap-2 pt-2">
            <ActionButton variant="outline" handleOpen={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" isPending={isPending} loadingContent={isCreate ? 'Creating…' : 'Saving…'}>
              {isCreate ? 'Create project' : 'Save changes'}
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
