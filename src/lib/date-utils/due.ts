import { differenceInCalendarDays, format } from 'date-fns';

/** Short due-date text: "Today", "Tomorrow", "2d overdue", or "Oct 12". */
export function formatDue(dueDate: string): string {
  const days = differenceInCalendarDays(new Date(dueDate), new Date());
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `${-days}d overdue`;
  return format(new Date(dueDate), 'MMM d');
}

/** Full date, e.g. "Oct 12, 2026". */
export function formatShortDate(date: string): string {
  return format(new Date(date), 'MMM d, yyyy');
}
