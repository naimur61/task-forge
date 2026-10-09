import { useApiMutation, useFetchData } from '@/hooks/api-hooks';
import type { ApiResponse, Paginated } from '@/types/common';
import type { Project, ProjectFilters, ProjectInput } from '@/types/project';

/** Cache keys for projects. `all` refreshes every project query at once. */
export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  detail: (projectId: string) => ['projects', 'detail', projectId] as const,
};

/** One page of my projects, with search and status filter. */
export const useProjects = (filters: ProjectFilters) =>
  useFetchData<Paginated<Project>>({
    path: 'projects',
    queryKey: projectKeys.list(filters),
    filterData: { ...filters },
    keepPreviousData: true,
  });

/** Create a project. I become its owner. */
export const useCreateProject = (onCreated: (project: Project) => void) =>
  useApiMutation<ApiResponse<Project>, ProjectInput>({
    method: 'POST',
    path: 'projects',
    invalidate: [projectKeys.all, ['dashboard']],
    successMessage: 'Project created',
    errorToast: false,
    onSuccess: (res) => onCreated(res.data),
  });
