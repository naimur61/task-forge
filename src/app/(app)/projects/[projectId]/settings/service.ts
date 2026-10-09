import { useApiMutation } from '@/hooks/api-hooks';
import type { ApiResponse } from '@/types/common';
import type { Project, ProjectInput } from '@/types/project';
import { projectKeys } from '../../service';

/** Save the project name and description. */
export const useUpdateProject = (projectId: string) =>
  useApiMutation<ApiResponse<Project>, ProjectInput>({
    method: 'PATCH',
    path: `projects/${projectId}`,
    invalidate: [projectKeys.all],
    successMessage: 'Project saved',
    errorToast: false,
  });

/** Archive (read-only) or restore the project. */
export const useSetArchived = (projectId: string) =>
  useApiMutation<ApiResponse<Project>, boolean>({
    method: 'POST',
    path: (archived) => `projects/${projectId}/${archived ? 'archive' : 'restore'}`,
    toBody: () => undefined,
    invalidate: [projectKeys.all, ['dashboard']],
    successMessage: 'Project updated',
  });

/** Delete the project for good. */
export const useDeleteProject = (projectId: string, onDone: () => void) =>
  useApiMutation<void, void>({
    method: 'DELETE',
    path: `projects/${projectId}`,
    invalidate: [projectKeys.all, ['dashboard']],
    successMessage: 'Project deleted',
    onSuccess: onDone,
  });
