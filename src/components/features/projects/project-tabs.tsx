'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, KanbanSquare, List, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectTabsProps {
  projectId: string;
  /** Settings is only shown to owners and admins. */
  showSettings: boolean;
}

/** Tab links under the project header: Board, List, Members, Activity, Settings. */
export function ProjectTabs({ projectId, showSettings }: ProjectTabsProps) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  const tabs = [
    { label: 'Board', href: `${base}/board`, icon: KanbanSquare },
    { label: 'List', href: `${base}/list`, icon: List },
    { label: 'Members', href: `${base}/members`, icon: Users },
    { label: 'Activity', href: `${base}/activity`, icon: Activity },
    ...(showSettings ? [{ label: 'Settings', href: `${base}/settings`, icon: Settings }] : []),
  ];

  return (
    <nav aria-label="Project sections" className="-mb-px flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
