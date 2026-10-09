'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { FolderPlus, SearchX } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorState } from '@/components/common/error-state/error-state';
import { useZodForm } from '@/components/common/forms/hooks/use-form';
import { projectSchema } from '@/components/common/forms/schemas/project';
import { PageHeader } from '@/components/common/page-header/page-header';
import { Pagination } from '@/components/common/pagination/pagination';
import { ProjectFormDialog } from '@/components/features/projects/project-form-dialog';
import { ProjectGrid, ProjectRows } from '@/components/features/projects/project-grid';
import { ProjectToolbar, type ProjectView } from '@/components/features/projects/project-toolbar';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { applyServerErrors } from '@/lib/http/form-errors';
import { PROJECTS_FIXTURE } from '@/mocks/fixtures/projects';
import type { ProjectStatus } from '@/types/project';
import { useCreateProject, useProjects } from './service';

const PAGE_SIZE = 9;

export default function ProjectsContainer() {
  const router = useRouter();
  const url = useUrlState();

  // Filters live in the URL so the page is shareable and the back button works.
  const search = url.get('search') ?? '';
  const status = url.get('status') as ProjectStatus | undefined;
  const page = Number(url.get('page') ?? 1);
  const view = (url.get('view') as ProjectView) ?? 'grid';
  const isCreateOpen = url.get('new') === '1';

  const projectsQuery = useProjects({ search, status, page, limit: PAGE_SIZE });
  const projects = projectsQuery.data?.data ?? [];
  const meta = projectsQuery.data?.meta;
  const hasFilters = !!search || !!status;

  // Create dialog
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(projectSchema, { defaultValues: { name: '', description: '' } });
  const createProject = useCreateProject((project) => router.push(`/projects/${project.id}/board`));

  const setCreateOpen = (open: boolean) => {
    if (!open) {
      form.reset();
      setFormError(null);
    }
    url.set({ new: open ? '1' : undefined });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createProject.mutateAsync(values);
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError));
    }
  });

  const newProjectButton = (
    <ActionButton icon={<FolderPlus />} handleOpen={() => setCreateOpen(true)}>
      New project
    </ActionButton>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Everything you own or are a member of." actions={newProjectButton} />

      <ProjectToolbar
        search={search}
        onSearch={(value) => url.set({ search: value, page: undefined })}
        status={status}
        onStatusChange={(value) => url.set({ status: value, page: undefined })}
        view={view}
        onViewChange={(value) => url.set({ view: value === 'grid' ? undefined : value })}
      />

      {projectsQuery.isError && <ErrorState error={projectsQuery.error} onRetry={() => projectsQuery.refetch()} />}

      {!projectsQuery.isError && (
        <Skeleton name="projects-grid" loading={projectsQuery.isPending} fixture={<ProjectGrid projects={PROJECTS_FIXTURE} />}>
          {projects.length === 0 && hasFilters && (
            <EmptyState
              icon={SearchX}
              title="No projects match your filters"
              action={
                <ActionButton variant="outline" handleOpen={() => url.clear(['search', 'status', 'page'])}>
                  Clear filters
                </ActionButton>
              }
            />
          )}
          {projects.length === 0 && !hasFilters && (
            <EmptyState
              icon={FolderPlus}
              title="No projects yet"
              description="Create a project to start planning tasks with your team."
              action={newProjectButton}
            />
          )}
          {projects.length > 0 && (view === 'grid' ? <ProjectGrid projects={projects} /> : <ProjectRows projects={projects} />)}
        </Skeleton>
      )}

      {meta && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          setCurrentPage={(next) => url.set({ page: next === 1 ? undefined : next })}
        />
      )}

      <ProjectFormDialog
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        form={form}
        onSubmit={onSubmit}
        isPending={createProject.isPending}
        error={formError}
      />
    </div>
  );
}
