import type { TaskPriority, TaskSortBy, TaskStatus } from '@/types/task';

/** Display info for each task status, in board order. `color` is a CSS variable from styles/status-colors.css. */
export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'TODO', label: 'Todo', color: 'var(--status-todo)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'var(--status-in-progress)' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'var(--status-in-review)' },
  { value: 'DONE', label: 'Done', color: 'var(--status-done)' },
];

/** Display info for each priority, lowest first. */
export const TASK_PRIORITIES: { value: TaskPriority; label: string; badge: string }[] = [
  { value: 'LOW', label: 'Low', badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
  { value: 'MEDIUM', label: 'Medium', badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { value: 'HIGH', label: 'High', badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  { value: 'URGENT', label: 'Urgent', badge: 'bg-red-500/10 text-red-700 dark:text-red-300' },
];

/** Sort options for the task list. */
export const TASK_SORT_OPTIONS: { value: TaskSortBy; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

/** Look up the display info for a status. */
export const statusInfo = (status: TaskStatus) => TASK_STATUSES.find((s) => s.value === status)!;

/** Look up the display info for a priority. */
export const priorityInfo = (priority: TaskPriority) => TASK_PRIORITIES.find((p) => p.value === priority)!;

/** True when the task is past its due date and not done. */
export function isTaskOverdue(task: { dueDate: string | null; status: TaskStatus }): boolean {
  return !!task.dueDate && task.status !== 'DONE' && new Date(task.dueDate).getTime() < Date.now();
}
