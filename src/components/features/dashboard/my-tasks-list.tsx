import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '@/components/features/tasks/task-badges';
import { isTaskOverdue } from '@/config/task';
import { formatDue } from '@/lib/date-utils/due';
import { cn } from '@/lib/utils';
import type { MyTask } from '@/types/dashboard';

/** Compact list of tasks assigned to me. Each row opens the task in its project. */
export function MyTasksList({ tasks, total = tasks.length }: { tasks: MyTask[]; total?: number }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nothing assigned to you. Nice!</p>;
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={`/projects/${task.projectId}/list?task=${task.id}`}
              className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                <p className="truncate text-xs text-muted-foreground">{task.projectName}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              {task.dueDate && (
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 text-xs',
                    isTaskOverdue(task) ? 'font-medium text-destructive' : 'text-muted-foreground',
                  )}
                >
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  {formatDue(task.dueDate, task.status === 'DONE')}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {total > tasks.length && (
        <p className="pt-3 text-xs text-muted-foreground">
          Showing {tasks.length} of {total} open tasks. Use a project&apos;s List tab with the &quot;Me&quot; filter to
          see the rest.
        </p>
      )}
    </>
  );
}
