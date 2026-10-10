import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useFetchData } from '@/hooks/api-hooks';
import type { ApiResponse, Paginated, UserSummary } from '@/types/common';
import type { AddMemberInput, Member } from '@/types/member';
import type { Project } from '@/types/project';
import type { Comment, Label, MoveTaskInput, Task, TaskFilters, TaskInput, TaskStatus } from '@/types/task';
import { projectKeys } from '../service';

/*
 * Calls shared by every tab of one project (board, list, members, task drawer).
 */

/** Tasks grouped by status, as the board endpoint returns them. */
export type Board = Record<TaskStatus, Task[]>;

/** Cache keys for one project's tasks, members and labels. */
export const taskKeys = {
  all: (projectId: string) => ['tasks', projectId] as const,
  list: (projectId: string, filters: TaskFilters) => ['tasks', projectId, 'list', filters] as const,
  board: (projectId: string, filters: Partial<TaskFilters>) => ['tasks', projectId, 'board', filters] as const,
  detail: (projectId: string, taskId: string) => ['tasks', projectId, 'detail', taskId] as const,
  comments: (projectId: string, taskId: string) => ['tasks', projectId, 'comments', taskId] as const,
};

export const memberKeys = {
  list: (projectId: string) => ['members', projectId] as const,
  search: (q: string) => ['users', 'search', q] as const,
};

export const labelKeys = {
  list: (projectId: string) => ['labels', projectId] as const,
};

/** Every query that shows task numbers (lists, board, project cards, dashboard). */
const taskRelatedKeys = (projectId: string) => [taskKeys.all(projectId), projectKeys.all, ['dashboard']];

/* ---------- Project ---------- */

/** One project with my role in it. */
export const useProject = (projectId: string) =>
  useFetchData<ApiResponse<Project>>({ path: `projects/${projectId}`, queryKey: projectKeys.detail(projectId) });

/* ---------- Members ---------- */

/** All members of the project (owner first). */
export const useMembers = (projectId: string) =>
  useFetchData<ApiResponse<Member[]>>({ path: `projects/${projectId}/members`, queryKey: memberKeys.list(projectId) });

/** Find registered users by name or email (at least 2 characters). */
export const useUserSearch = (q: string) =>
  useFetchData<ApiResponse<UserSummary[]>>({
    path: 'users/search',
    queryKey: memberKeys.search(q),
    filterData: { q },
    enabled: q.trim().length >= 2,
  });

/** Add a user to the project. */
export const useAddMember = (projectId: string, onDone: () => void) =>
  useApiMutation<ApiResponse<Member>, AddMemberInput>({
    method: 'POST',
    path: `projects/${projectId}/members`,
    invalidate: [memberKeys.list(projectId), projectKeys.all],
    successMessage: 'Member added',
    onSuccess: onDone,
  });

/** Change a member's role (owner only). */
export const useChangeRole = (projectId: string) =>
  useApiMutation<ApiResponse<Member>, { userId: string; role: AddMemberInput['role'] }>({
    method: 'PATCH',
    path: ({ userId }) => `projects/${projectId}/members/${userId}`,
    toBody: ({ role }) => ({ role }),
    invalidate: [memberKeys.list(projectId)],
    successMessage: 'Role updated',
  });

/** Remove a member, or leave the project when it is my own id. */
export const useRemoveMember = (projectId: string, onDone?: () => void) =>
  useApiMutation<void, string>({
    method: 'DELETE',
    path: (userId) => `projects/${projectId}/members/${userId}`,
    invalidate: [memberKeys.list(projectId), projectKeys.all, taskKeys.all(projectId)],
    successMessage: 'Member removed',
    onSuccess: () => onDone?.(),
  });

/** Make another member the owner. I become an admin. */
export const useTransferOwnership = (projectId: string) =>
  useApiMutation<ApiResponse<Member>, string>({
    method: 'POST',
    path: `projects/${projectId}/transfer-ownership`,
    toBody: (userId) => ({ userId }),
    invalidate: [memberKeys.list(projectId), projectKeys.all],
    successMessage: 'Ownership transferred',
  });

/* ---------- Labels ---------- */

/** Labels that tasks in this project can use. */
export const useLabels = (projectId: string) =>
  useFetchData<ApiResponse<Label[]>>({ path: `projects/${projectId}/labels`, queryKey: labelKeys.list(projectId) });

/** Create a label (owner/admin). */
export const useCreateLabel = (projectId: string, onDone: () => void) =>
  useApiMutation<ApiResponse<Label>, { name: string; color: string }>({
    method: 'POST',
    path: `projects/${projectId}/labels`,
    invalidate: [labelKeys.list(projectId)],
    successMessage: 'Label created',
    onSuccess: onDone,
  });

/* ---------- Tasks ---------- */

/** One page of tasks with filters and sort (list view). */
export const useTaskList = (projectId: string, filters: TaskFilters) =>
  useFetchData<Paginated<Task>>({
    path: `projects/${projectId}/tasks`,
    queryKey: taskKeys.list(projectId, filters),
    filterData: { ...filters },
    keepPreviousData: true,
  });

/** All tasks grouped by status (board view). */
export const useBoard = (projectId: string, filters: Partial<TaskFilters>) =>
  useFetchData<ApiResponse<Board>>({
    path: `projects/${projectId}/board`,
    queryKey: taskKeys.board(projectId, filters),
    filterData: { ...filters },
    keepPreviousData: true,
  });

/** One task (task drawer). */
export const useTask = (projectId: string, taskId: string | undefined) =>
  useFetchData<ApiResponse<Task>>({
    path: `projects/${projectId}/tasks/${taskId}`,
    queryKey: taskKeys.detail(projectId, taskId ?? ''),
    enabled: !!taskId,
  });

/** Create a task. */
export const useCreateTask = (projectId: string, onCreated: (task: Task) => void) =>
  useApiMutation<ApiResponse<Task>, TaskInput>({
    method: 'POST',
    path: `projects/${projectId}/tasks`,
    invalidate: taskRelatedKeys(projectId),
    successMessage: 'Task created',
    errorToast: false,
    onSuccess: (res) => onCreated(res.data),
  });

/** Update any task fields. */
export const useUpdateTask = (projectId: string) =>
  useApiMutation<ApiResponse<Task>, { taskId: string; changes: Partial<TaskInput> }>({
    method: 'PATCH',
    path: ({ taskId }) => `projects/${projectId}/tasks/${taskId}`,
    toBody: ({ changes }) => changes,
    invalidate: taskRelatedKeys(projectId),
    successMessage: 'Task saved',
    errorToast: false,
  });

/** Delete a task. */
export const useDeleteTask = (projectId: string, onDone: () => void) =>
  useApiMutation<void, string>({
    method: 'DELETE',
    path: (taskId) => `projects/${projectId}/tasks/${taskId}`,
    invalidate: taskRelatedKeys(projectId),
    successMessage: 'Task deleted',
    onSuccess: onDone,
  });

/**
 * Move a task on the board. Updates the screen right away (optimistic),
 * and puts it back if the server says no.
 */
export function useMoveTask(projectId: string, boardKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  return useApiMutation<ApiResponse<Task>, { task: Task } & MoveTaskInput, { previous?: ApiResponse<Board> }>({
    method: 'PATCH',
    path: ({ task }) => `projects/${projectId}/tasks/${task.id}/move`,
    toBody: ({ status, afterId }) => ({ status, afterId }),
    invalidate: taskRelatedKeys(projectId),
    onMutate: async ({ task, status, afterId }) => {
      await queryClient.cancelQueries({ queryKey: boardKey });
      const previous = queryClient.getQueryData<ApiResponse<Board>>(boardKey);
      if (previous) {
        queryClient.setQueryData<ApiResponse<Board>>(boardKey, { data: moveInBoard(previous.data, task, status, afterId ?? null) });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous);
    },
  });
}

/** Return a new board with the task moved to `status`, right after `afterId` (or at the top). */
function moveInBoard(board: Board, task: Task, status: TaskStatus, afterId: string | null): Board {
  const next = { ...board } as Board;
  next[task.status] = board[task.status].filter((t) => t.id !== task.id);
  const column = (task.status === status ? next[task.status] : board[status]).filter((t) => t.id !== task.id);
  const index = afterId ? column.findIndex((t) => t.id === afterId) + 1 : 0;
  next[status] = [...column.slice(0, index), { ...task, status }, ...column.slice(index)];
  return next;
}

/* ---------- Comments ---------- */

/** Comments on a task, oldest first. */
export const useComments = (projectId: string, taskId: string) =>
  useFetchData<ApiResponse<Comment[]>>({
    path: `projects/${projectId}/tasks/${taskId}/comments`,
    queryKey: taskKeys.comments(projectId, taskId),
    enabled: !!taskId,
  });

/** Add a comment. */
export const useAddComment = (projectId: string, taskId: string, onDone: () => void) =>
  useApiMutation<ApiResponse<Comment>, { body: string }>({
    method: 'POST',
    path: `projects/${projectId}/tasks/${taskId}/comments`,
    invalidate: [taskKeys.comments(projectId, taskId), taskKeys.all(projectId)],
    onSuccess: onDone,
  });

/** Edit my comment. */
export const useUpdateComment = (projectId: string, taskId: string) =>
  useApiMutation<ApiResponse<Comment>, { commentId: string; body: string }>({
    method: 'PATCH',
    path: ({ commentId }) => `projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    toBody: ({ body }) => ({ body }),
    invalidate: [taskKeys.comments(projectId, taskId)],
  });

/** Delete a comment. */
export const useDeleteComment = (projectId: string, taskId: string) =>
  useApiMutation<void, string>({
    method: 'DELETE',
    path: (commentId) => `projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    invalidate: [taskKeys.comments(projectId, taskId), taskKeys.all(projectId)],
    successMessage: 'Comment deleted',
  });
