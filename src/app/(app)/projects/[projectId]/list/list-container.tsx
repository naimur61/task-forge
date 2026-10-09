'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import toast from 'react-hot-toast';
import { ListTodo, SearchX } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorState } from '@/components/common/error-state/error-state';
import { PageSizeSelect } from '@/components/common/pagination/page-size-select';
import { Pagination } from '@/components/common/pagination/pagination';
import { TaskFilters } from '@/components/features/tasks/task-filters';
import { TaskTable } from '@/components/features/tasks/task-table';
import { useAuth } from '@/hooks/use-auth';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { getErrorMessage } from '@/lib/http/api-error';
import { canEditTask } from '@/lib/permissions';
import { TASKS_FIXTURE } from '@/mocks/fixtures/tasks';
import type { Task, TaskFilters as Filters, TaskPriority, TaskSortBy, TaskStatus } from '@/types/task';
import { useMembers, useProject, useTaskList, useUpdateTask } from '../service';

/** URL keys this page owns. "Clear all" removes them. */
const FILTER_KEYS = ['search', 'status', 'priority', 'assigneeId', 'overdue', 'page'];

export default function ListContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const url = useUrlState();

  // Every filter, the sort and the page come from the URL.
  const filters: Filters = {
    search: url.get('search'),
    status: url.getAll('status') as TaskStatus[],
    priority: url.getAll('priority') as TaskPriority[],
    assigneeId: url.get('assigneeId'),
    overdue: url.get('overdue') === 'true' || undefined,
    sortBy: url.get('sortBy') as TaskSortBy | undefined,
    order: url.get('order') as Filters['order'],
    page: Number(url.get('page') ?? 1),
    limit: Number(url.get('limit') ?? 10),
  };
  const hasFilters = FILTER_KEYS.some((key) => key !== 'page' && url.getAll(key).length > 0);

  const project = useProject(projectId).data?.data;
  const members = useMembers(projectId).data?.data ?? [];
  const tasksQuery = useTaskList(projectId, filters);
  const tasks = tasksQuery.data?.data ?? [];
  const meta = tasksQuery.data?.meta;
  const updateTask = useUpdateTask(projectId);

  // Any filter change goes back to page 1.
  const changeFilters = (changes: Partial<Filters>) => url.set({ ...changes, page: undefined });

  const canEdit = (task: Task) =>
    !!project &&
    project.status === 'ACTIVE' &&
    canEditTask(project.myRole, user?.id ?? '', { creatorId: task.creator.id, assigneeId: task.assignee?.id ?? null });

  const changeStatus = (task: Task, status: TaskStatus) =>
    updateTask.mutate(
      { taskId: task.id, changes: { status } },
      { onError: (error) => toast.error(getErrorMessage(error)) },
    );

  return (
    <div className="space-y-4">
      <TaskFilters filters={filters} members={members} onChange={changeFilters} onClearAll={() => url.clear(FILTER_KEYS)} />

      {tasksQuery.isError ? (
        <ErrorState error={tasksQuery.error} onRetry={() => tasksQuery.refetch()} />
      ) : (
        <Skeleton
          name="task-list"
          loading={tasksQuery.isPending}
          fixture={<TaskTable tasks={TASKS_FIXTURE} onOpen={() => undefined} canEdit={() => true} onStatusChange={() => undefined} />}
        >
          {tasks.length === 0 && hasFilters && (
            <EmptyState
              icon={SearchX}
              title="No tasks match your filters"
              action={
                <ActionButton variant="outline" handleOpen={() => url.clear(FILTER_KEYS)}>
                  Clear filters
                </ActionButton>
              }
            />
          )}
          {tasks.length === 0 && !hasFilters && (
            <EmptyState icon={ListTodo} title="No tasks yet" description="Create the first task for this project." />
          )}
          {tasks.length > 0 && (
            <TaskTable tasks={tasks} onOpen={(task) => url.set({ task: task.id })} canEdit={canEdit} onStatusChange={changeStatus} />
          )}
        </Skeleton>
      )}

      {meta && meta.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <PageSizeSelect value={meta.limit} total={meta.total} onChange={(limit) => url.set({ limit: limit === 10 ? undefined : limit, page: undefined })} />
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            setCurrentPage={(next) => url.set({ page: next === 1 ? undefined : next })}
          />
        </div>
      )}
    </div>
  );
}
