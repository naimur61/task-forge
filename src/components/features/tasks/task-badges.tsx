import { priorityInfo, statusInfo } from '@/config/task';
import { cn } from '@/lib/utils';
import type { TaskPriority, TaskStatus } from '@/types/task';

/** Colored pill with a dot, e.g. "● In Progress". */
export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const info = statusInfo(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} aria-hidden />
      {info.label}
    </span>
  );
}

/** Colored pill for task priority. */
export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  const info = priorityInfo(priority);
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', info.badge, className)}>
      {info.label}
    </span>
  );
}

/** Small colored label chip. */
export function LabelChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      {name}
    </span>
  );
}
