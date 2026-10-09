import { CalendarClock, MessageSquare } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { isTaskOverdue } from '@/config/task';
import { formatDue } from '@/lib/date-utils/due';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import { LabelChip, PriorityBadge } from './task-badges';

interface TaskCardProps {
  task: Task;
  /** Card is being dragged (shown in the drag overlay). */
  isDragging?: boolean;
  className?: string;
}

/** Compact task card used on the board. */
export function TaskCard({ task, isDragging = false, className }: TaskCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-shadow',
        isDragging && 'rotate-1 shadow-xl ring-2 ring-primary/40',
        className,
      )}
    >
      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <LabelChip key={label.id} name={label.name} color={label.color} />
          ))}
        </div>
      )}
      <p className="line-clamp-3 text-sm font-medium text-foreground">{task.title}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 whitespace-nowrap',
                isTaskOverdue(task) ? 'font-medium text-destructive' : 'text-muted-foreground',
              )}
            >
              <CalendarClock className="h-3 w-3" aria-hidden />
              {formatDue(task.dueDate, task.status === 'DONE')}
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <MessageSquare className="h-3 w-3" aria-hidden /> {task.commentCount}
            </span>
          )}
        </div>
        <UserAvatar user={task.assignee} size="xs" />
      </div>
    </div>
  );
}
