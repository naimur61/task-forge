import Link from 'next/link';
import { AlarmClock, Archive } from 'lucide-react';
import { AvatarStack } from '@/components/common/user-avatar/user-avatar';
import { Progress } from '@/components/ui/progress';
import { formatRelativeTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import { RoleBadge } from './role-badge';

/** Card for one project: name, description, progress, members and role. */
export function ProjectCard({ project }: { project: Project }) {
  const progress = project.taskCount ? Math.round((project.doneCount / project.taskCount) * 100) : 0;
  const isArchived = project.status === 'ARCHIVED';

  return (
    <Link
      href={`/projects/${project.id}/board`}
      className={cn(
        'group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isArchived && 'opacity-75',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary">{project.name}</h3>
        <RoleBadge role={project.myRole} />
      </div>
      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || 'No description'}</p>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {project.doneCount}/{project.taskCount} tasks done
          </span>
          <span className="font-medium tabular-nums text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-muted" aria-label={`${progress}% complete`} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
        <AvatarStack users={project.membersPreview} total={project.memberCount} />
        <div className="flex items-center gap-2 text-xs">
          {isArchived && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Archive className="h-3.5 w-3.5" aria-hidden /> Archived
            </span>
          )}
          {!isArchived && project.overdueCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-destructive">
              <AlarmClock className="h-3.5 w-3.5" aria-hidden /> {project.overdueCount} overdue
            </span>
          )}
          {!isArchived && project.overdueCount === 0 && (
            <span className="text-muted-foreground">Updated {formatRelativeTime(project.updatedAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
