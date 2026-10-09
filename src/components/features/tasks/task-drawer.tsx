'use client';

import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorAlert } from '@/components/common/error-alert/error-alert';
import type { TaskFormData } from '@/components/common/forms/schemas/task';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatShortDate } from '@/lib/date-utils/due';
import type { Member } from '@/types/member';
import type { Label, Task } from '@/types/task';
import { TaskFormFields } from './task-form-fields';

interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task | undefined;
  isLoading: boolean;
  /** True when the task could not be loaded (deleted or no access). */
  notFound: boolean;
  form: UseFormReturn<TaskFormData>;
  members: Member[];
  labels: Label[];
  canEdit: boolean;
  canDelete: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSaving: boolean;
  error: string | null;
  onDelete: () => void;
  /** Comment thread, rendered below the form. */
  comments: ReactNode;
}

/** Side panel with task details, edit form and comments. Full screen on mobile. */
export function TaskDrawer({
  open,
  onClose,
  task,
  isLoading,
  notFound,
  form,
  members,
  labels,
  canEdit,
  canDelete,
  onSubmit,
  isSaving,
  error,
  onDelete,
  comments,
}: TaskDrawerProps) {
  // Ask before throwing away unsaved edits.
  const handleOpenChange = (next: boolean) => {
    if (!next && form.formState.isDirty && !window.confirm('Discard your unsaved changes?')) return;
    if (!next) onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4 text-left">
          <SheetTitle className="pr-8">{task ? task.title : notFound ? 'Task not found' : 'Loading task…'}</SheetTitle>
          {task && (
            <SheetDescription>
              Created by {task.creator.name} on {formatShortDate(task.createdAt)}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="space-y-8 px-6 py-5">
          {notFound && (
            <EmptyState title="Task not found" description="It may have been deleted, or you don't have access to it." />
          )}

          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {task && (
            <>
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <ErrorAlert error={error} />
                <TaskFormFields form={form} members={members} labels={labels} readOnly={!canEdit} />
                {!canEdit && (
                  <p className="text-xs text-muted-foreground">Only admins, the creator and the assignee can edit this task.</p>
                )}
                <div className="flex items-center justify-between gap-2">
                  {canDelete ? (
                    <ActionButton variant="ghost" size="sm" icon={<Trash2 />} className="text-destructive" handleOpen={onDelete}>
                      Delete
                    </ActionButton>
                  ) : (
                    <span />
                  )}
                  {canEdit && (
                    <ActionButton type="submit" isPending={isSaving} disabled={!form.formState.isDirty} loadingContent="Saving…">
                      Save changes
                    </ActionButton>
                  )}
                </div>
              </form>
              <div className="border-t border-border pt-6">{comments}</div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
