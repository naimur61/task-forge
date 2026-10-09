'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { FolderX, Plus } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorState } from '@/components/common/error-state/error-state';
import { ProjectHeader } from '@/components/features/projects/project-header';
import { ProjectTabs } from '@/components/features/projects/project-tabs';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { isApiError } from '@/lib/http/api-error';
import { can } from '@/lib/permissions';
import { PROJECTS_FIXTURE } from '@/mocks/fixtures/projects';
import { useProject } from './service';
import TaskPanelsContainer from './task-panels-container';

interface ProjectShellContainerProps {
  projectId: string;
  children: ReactNode;
}

export default function ProjectShellContainer({ projectId, children }: ProjectShellContainerProps) {
  const router = useRouter();
  const url = useUrlState();
  const projectQuery = useProject(projectId);
  const project = projectQuery.data?.data;

  // 404 also covers "not a member": the API hides projects you can't see.
  if (projectQuery.isError && isApiError(projectQuery.error) && projectQuery.error.status === 404) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="It may have been deleted, or you are not a member of it."
        action={<ActionButton handleOpen={() => router.push('/projects')}>Back to projects</ActionButton>}
        className="mt-10"
      />
    );
  }
  if (projectQuery.isError) return <ErrorState error={projectQuery.error} onRetry={() => projectQuery.refetch()} />;

  const isArchived = project?.status === 'ARCHIVED';
  const newTaskButton = (
    <ActionButton icon={<Plus />} disabled={isArchived} handleOpen={() => url.set({ newTask: 'TODO' })}>
      New task
    </ActionButton>
  );

  return (
    <div className="space-y-5">
      <Skeleton name="project-header" loading={projectQuery.isPending} fixture={<ProjectHeader project={PROJECTS_FIXTURE[0]} />}>
        {project && <ProjectHeader project={project} actions={newTaskButton} />}
      </Skeleton>

      <ProjectTabs projectId={projectId} showSettings={can(project?.myRole, 'project.update')} />

      <div>{children}</div>

      {project && <TaskPanelsContainer project={project} />}
    </div>
  );
}
