'use client';

import type { UseFormReturn } from 'react-hook-form';
import { ActionButton } from '@/components/common/button';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';
import type { TaskFormData } from '@/components/common/forms/schemas/task';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/custom/dialog';
import type { Member } from '@/types/member';
import type { Label } from '@/types/task';
import { TaskFormFields } from './task-form-fields';

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TaskFormData>;
  members: Member[];
  labels: Label[];
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

/** "New task" dialog. State lives in the container. */
export function TaskCreateDialog({ open, onOpenChange, form, members, labels, onSubmit, isPending, error }: TaskCreateDialogProps) {
  // Ask before throwing away typed changes.
  const handleOpenChange = (next: boolean) => {
    if (!next && form.formState.isDirty && !isPending && !window.confirm('Discard this task?')) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Only the title is required. You can fill in the rest later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <ErrorAlert error={error} />
          <TaskFormFields form={form} members={members} labels={labels} />
          <DialogFooter className="gap-2 pt-2">
            <ActionButton variant="outline" handleOpen={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" isPending={isPending} loadingContent="Creating…">
              Create task
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
