'use client';

import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { emptyTaskForm, formToTaskInput, taskSchema, taskToForm } from '@/components/common/forms/schemas/task';
import { CommentThread } from '@/components/features/comments/comment-thread';
import { TaskCreateDialog } from '@/components/features/tasks/task-create-dialog';
import { TaskDrawer } from '@/components/features/tasks/task-drawer';
import { useAuth } from '@/hooks/use-auth';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { isApiError } from '@/lib/http/api-error';
import { applyServerErrors } from '@/lib/http/form-errors';
import { can, canDeleteTask, canEditTask } from '@/lib/permissions';
import type { Project } from '@/types/project';
import type { Member } from '@/types/member';
import type { Label, TaskStatus } from '@/types/task';
import {
  useAddComment,
  useComments,
  useCreateTask,
  useDeleteComment,
  useDeleteTask,
  useLabels,
  useMembers,
  useTask,
  useUpdateComment,
  useUpdateTask,
} from './service';

/** "New task" dialog (`?newTask=STATUS`) and the task drawer (`?task=ID`), shared by every project tab. */
export default function TaskPanelsContainer({ project }: { project: Project }) {
  const url = useUrlState();
  const newTaskStatus = url.get('newTask') as TaskStatus | undefined;
  const openTaskId = url.get('task');

  const members = useMembers(project.id).data?.data ?? [];
  const labels = useLabels(project.id).data?.data ?? [];

  return (
    <>
      <CreateTaskPanel
        project={project}
        status={newTaskStatus}
        members={members}
        labels={labels}
        onClose={() => url.set({ newTask: undefined })}
        onCreated={(taskId) => url.set({ newTask: undefined, task: taskId })}
      />
      <TaskDrawerPanel
        project={project}
        taskId={openTaskId}
        members={members}
        labels={labels}
        onClose={() => url.set({ task: undefined })}
      />
    </>
  );
}

interface PanelProps {
  project: Project;
  members: Member[];
  labels: Label[];
}

/* ---------- New task ---------- */

function CreateTaskPanel({
  project,
  status,
  members,
  labels,
  onClose,
  onCreated,
}: PanelProps & { status: TaskStatus | undefined; onClose: () => void; onCreated: (taskId: string) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(taskSchema, { defaultValues: emptyTaskForm() });
  const createTask = useCreateTask(project.id, (task) => onCreated(task.id));

  // Start each new task from a clean form in the requested column.
  useEffect(() => {
    if (status) {
      form.reset(emptyTaskForm(status));
      setFormError(null);
    }
  }, [status, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createTask.mutateAsync(formToTaskInput(values));
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError));
    }
  });

  return (
    <TaskCreateDialog
      open={!!status}
      onOpenChange={(open) => !open && onClose()}
      form={form}
      members={members}
      labels={labels}
      onSubmit={onSubmit}
      isPending={createTask.isPending}
      error={formError}
    />
  );
}

/* ---------- Task drawer ---------- */

function TaskDrawerPanel({ project, taskId, members, labels, onClose }: PanelProps & { taskId: string | undefined; onClose: () => void }) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const taskQuery = useTask(project.id, taskId);
  const task = taskQuery.data?.data;
  const notFound = taskQuery.isError && isApiError(taskQuery.error) && taskQuery.error.status === 404;

  const form = useZodForm(taskSchema, { defaultValues: emptyTaskForm() });
  const updateTask = useUpdateTask(project.id);
  const deleteTask = useDeleteTask(project.id, () => {
    setConfirmDelete(false);
    onClose();
  });

  // Load the task into the form whenever it (re)loads from the server.
  useEffect(() => {
    if (task) {
      form.reset(taskToForm(task));
      setFormError(null);
    }
  }, [task, form]);

  const comments = useComments(project.id, taskId ?? '');
  const addComment = useAddComment(project.id, taskId ?? '', () => undefined);
  const updateComment = useUpdateComment(project.id, taskId ?? '');
  const deleteComment = useDeleteComment(project.id, taskId ?? '');

  const isArchived = project.status === 'ARCHIVED';
  const ownership = task ? { creatorId: task.creator.id, assigneeId: task.assignee?.id ?? null } : null;
  const canEdit = !!ownership && !isArchived && canEditTask(project.myRole, userId, ownership);
  const canDelete = !!ownership && !isArchived && canDeleteTask(project.myRole, userId, ownership);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!task) return;
    setFormError(null);
    try {
      await updateTask.mutateAsync({ taskId: task.id, changes: formToTaskInput(values) });
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError));
    }
  });

  return (
    <>
      <TaskDrawer
        open={!!taskId}
        onClose={onClose}
        task={task}
        isLoading={taskQuery.isPending && !!taskId}
        notFound={notFound}
        form={form}
        members={members}
        labels={labels}
        canEdit={canEdit}
        canDelete={canDelete}
        onSubmit={onSubmit}
        isSaving={updateTask.isPending}
        error={formError}
        onDelete={() => setConfirmDelete(true)}
        comments={
          taskId && (
            <CommentThread
              comments={comments.data?.data ?? []}
              isLoading={comments.isPending}
              currentUserId={userId}
              canDeleteAny={can(project.myRole, 'comment.deleteAny')}
              onAdd={(body) => addComment.mutate({ body })}
              isAdding={addComment.isPending}
              onEdit={(commentId, body) => updateComment.mutate({ commentId, body })}
              onDelete={(commentId) => deleteComment.mutate(commentId)}
            />
          )
        }
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this task?"
        description={task ? `"${task.title}" and its comments will be removed. This can't be undone.` : undefined}
        confirmLabel="Delete task"
        destructive
        isPending={deleteTask.isPending}
        onConfirm={() => task && deleteTask.mutate(task.id)}
      />
    </>
  );
}
