import type { LucideIcon } from 'lucide-react';
import { AlarmClock, CheckCircle2, Flame, FolderKanban, FolderOpen, ListTodo, UserRoundCheck } from 'lucide-react';
import type { DashboardSummary } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  /** Draw attention (e.g. overdue tasks). */
  alert?: boolean;
}

/** Build the list of stat tiles from the summary. */
function toStats(summary: DashboardSummary): Stat[] {
  const { projects, tasks } = summary;
  const completion = tasks.total ? Math.round((tasks.completed / tasks.total) * 100) : 0;
  return [
    { label: 'Total projects', value: projects.total, icon: FolderKanban, hint: `${projects.archived} archived` },
    { label: 'Active projects', value: projects.active, icon: FolderOpen },
    { label: 'Total tasks', value: tasks.total, icon: ListTodo, hint: `${tasks.inProgress} in progress` },
    { label: 'Completed', value: tasks.completed, icon: CheckCircle2, hint: `${completion}% of all tasks` },
    { label: 'High priority', value: tasks.highPriority, icon: Flame, hint: 'High + urgent, not done' },
    { label: 'Overdue', value: tasks.overdue, icon: AlarmClock, alert: tasks.overdue > 0, hint: 'Past due, not done' },
    { label: 'Assigned to me', value: tasks.assignedToMe, icon: UserRoundCheck, hint: 'Open tasks' },
  ];
}

/** Row of headline numbers at the top of the dashboard. */
export function StatCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
      {toStats(summary).map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <Icon className={cn('h-4 w-4', stat.alert ? 'text-destructive' : 'text-muted-foreground')} aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            {stat.hint && (
              <p className={cn('mt-0.5 truncate text-xs', stat.alert ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                {stat.hint}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
