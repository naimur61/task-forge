import Link from 'next/link';
import { AvatarStack } from '@/components/common/user-avatar/user-avatar';
import { Progress } from '@/components/ui/progress';
import type { Project } from '@/types/project';
import { ProjectCard } from './project-card';
import { RoleBadge } from './role-badge';

/** Projects as a responsive grid of cards. */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

/** Projects as compact rows (list view). */
export function ProjectRows({ projects }: { projects: Project[] }) {
  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
      {projects.map((project) => {
        const progress = project.taskCount ? Math.round((project.doneCount / project.taskCount) * 100) : 0;
        return (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}/board`}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{project.name}</p>
                <p className="truncate text-sm text-muted-foreground">{project.description || 'No description'}</p>
              </div>
              <div className="hidden w-40 shrink-0 space-y-1 lg:block">
                <p className="text-right text-xs tabular-nums text-muted-foreground">{progress}% done</p>
                <Progress value={progress} className="h-1.5 bg-muted" aria-label={`${progress}% complete`} />
              </div>
              <div className="hidden sm:block">
                <AvatarStack users={project.membersPreview} total={project.memberCount} max={3} />
              </div>
              <RoleBadge role={project.myRole} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
