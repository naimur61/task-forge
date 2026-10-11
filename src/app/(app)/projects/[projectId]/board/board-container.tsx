'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { ErrorState } from '@/components/common/error-state/error-state';
import { SearchInput } from '@/components/common/search-input/search-input';
import { KanbanBoard, type BoardColumns } from '@/components/features/tasks/kanban-board';
import { useAuth } from '@/hooks/use-auth';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { canEditTask } from '@/lib/permissions';
import type { Task } from '@/types/task';
import { taskKeys, useBoard, useMoveTask, useProject } from '../service';

const EMPTY_BOARD: BoardColumns = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };

export default function BoardContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const url = useUrlState();
  const search = url.get('search') ?? '';

  const project = useProject(projectId).data?.data;
  const filters = { search: search || undefined };
  const boardQuery = useBoard(projectId, filters);
  const moveTask = useMoveTask(projectId, taskKeys.board(projectId, filters));
  const isActive = project?.status === 'ACTIVE';

  const canMove = (task: Task) =>
    !!project &&
    isActive &&
    canEditTask(project.myRole, user?.id ?? '', { creatorId: task.creator.id, assigneeId: task.assignee?.id ?? null });

  if (boardQuery.isError) return <ErrorState error={boardQuery.error} onRetry={() => boardQuery.refetch()} />;

  return (
    <div className="space-y-4">
      <SearchInput value={search} onSearch={(value) => url.set({ search: value })} placeholder="Search this board…" className="sm:w-72" />
      <Skeleton name="kanban-board" loading={boardQuery.isPending}>
        <KanbanBoard
          columns={boardQuery.data?.data ?? EMPTY_BOARD}
          onOpen={(task) => url.set({ task: task.id })}
          canMove={canMove}
          onMove={(task, status, afterId) => moveTask.mutate({ task, status, afterId })}
          onQuickAdd={isActive ? (status) => url.set({ newTask: status }) : undefined}
        />
      </Skeleton>
    </div>
  );
}
