'use client';

import { CalendarClock, MessageSquare } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isTaskOverdue } from '@/config/task';
import { formatDue } from '@/lib/date-utils/due';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task';
import { LabelChip, PriorityBadge } from './task-badges';
import { TaskStatusMenu } from './task-status-menu';

interface TaskTableProps {
  tasks: Task[];
  onOpen: (task: Task) => void;
  /** Whether the current user may edit this task. */
  canEdit: (task: Task) => boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

/** Due date text, red when overdue. */
function DueDate({ task }: { task: Task }) {
  if (!task.dueDate) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn('inline-flex items-center gap-1', isTaskOverdue(task) ? 'font-medium text-destructive' : 'text-muted-foreground')}>
      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
      {formatDue(task.dueDate)}
    </span>
  );
}

/** Task list: a table on desktop, stacked cards on phones. Clicking a row opens the task. */
export function TaskTable({ tasks, onOpen, canEdit, onStatusChange }: TaskTableProps) {
  return (
    <>
      {/* Desktop and tablet */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[45%]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="hidden lg:table-cell">Assignee</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                onClick={() => onOpen(task)}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
                tabIndex={0}
                className="cursor-pointer focus-visible:bg-accent focus-visible:outline-none"
              >
                <TableCell>
                  <p className="line-clamp-1 font-medium text-foreground">{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {task.labels.map((label) => (
                      <LabelChip key={label.id} name={label.name} color={label.color} />
                    ))}
                    {task.commentCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" aria-hidden /> {task.commentCount}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TaskStatusMenu status={task.status} canChange={canEdit(task)} onChange={(s) => onStatusChange(task, s)} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="flex items-center gap-2 text-sm">
                    <UserAvatar user={task.assignee} size="xs" />
                    <span className={cn('truncate', !task.assignee && 'text-muted-foreground')}>{task.assignee?.name ?? 'Unassigned'}</span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  <DueDate task={task} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Phones */}
      <ul className="space-y-2 md:hidden">
        {tasks.map((task) => (
          <li key={task.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(task)}
              onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">{task.title}</p>
                <UserAvatar user={task.assignee} size="sm" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <TaskStatusMenu status={task.status} canChange={canEdit(task)} onChange={(s) => onStatusChange(task, s)} />
                <PriorityBadge priority={task.priority} />
                <DueDate task={task} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
