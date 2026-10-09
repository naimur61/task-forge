'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { projectSchema } from '@/components/common/forms/schemas/project';
import { ProjectDangerZone } from '@/components/features/projects/project-danger-zone';
import { ProjectSettingsForm } from '@/components/features/projects/project-settings-form';
import { applyServerErrors } from '@/lib/http/form-errors';
import { can } from '@/lib/permissions';
import { useProject } from '../service';
import { useDeleteProject, useSetArchived, useUpdateProject } from './service';

export default function SettingsContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const project = useProject(projectId).data?.data;

  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const form = useZodForm(projectSchema, { defaultValues: { name: '', description: '' } });
  const updateProject = useUpdateProject(projectId);
  const setArchived = useSetArchived(projectId);
  const deleteProject = useDeleteProject(projectId, () => router.replace('/projects'));

  // Fill the form whenever the project (re)loads.
  useEffect(() => {
    if (project) form.reset({ name: project.name, description: project.description ?? '' });
  }, [project, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updateProject.mutateAsync(values);
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError));
    }
  });

  // The layout shows the header and loading state; wait for the project here.
  if (!project) return null;

  if (!can(project.myRole, 'project.update')) {
    return <EmptyState icon={Lock} title="Only owners and admins can change settings" />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <ProjectSettingsForm form={form} onSubmit={onSubmit} isPending={updateProject.isPending} error={formError} />

      {can(project.myRole, 'project.delete') && (
        <ProjectDangerZone
          isArchived={project.status === 'ARCHIVED'}
          onArchiveToggle={() => setArchived.mutate(project.status !== 'ARCHIVED')}
          isArchivePending={setArchived.isPending}
          onDelete={() => setDeleteOpen(true)}
        />
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this project?"
        description="This removes all tasks, comments and members. It can't be undone."
        confirmText={project.name}
        confirmLabel="Delete project"
        destructive
        isPending={deleteProject.isPending}
        onConfirm={() => deleteProject.mutate()}
      />
    </div>
  );
}
