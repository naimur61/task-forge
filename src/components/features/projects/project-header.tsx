import type { ReactNode } from 'react';
import { Archive } from 'lucide-react';
import { AvatarStack } from '@/components/common/user-avatar/user-avatar';
import type { Project } from '@/types/project';
import { RoleBadge } from './role-badge';

interface ProjectHeaderProps {
  project: Project;
  /** Buttons on the right (e.g. "New task"). */
  actions?: ReactNode;
}

/** Project name, role, members and actions at the top of every project tab. */
export function ProjectHeader({ project, actions }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          <RoleBadge role={project.myRole} />
          {project.status === 'ARCHIVED' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <Archive className="h-3 w-3" aria-hidden /> Archived · read-only
            </span>
          )}
        </div>
        {project.description && <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <AvatarStack users={project.membersPreview} total={project.memberCount} />
        {actions}
      </div>
    </div>
  );
}
