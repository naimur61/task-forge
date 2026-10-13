import { Bell, FolderKanban, FolderPlus, Keyboard, LayoutDashboard, ListPlus, MoonStar, UserRound } from 'lucide-react';
import type { Project } from '@/types/project';
import type { PaletteGroup } from './command-palette';

interface PaletteOptions {
  /** True inside a project, where "New task" makes sense. */
  inProject: boolean;
  projects: Project[];
  go: (path: string) => void;
  createSomething: () => void;
  toggleTheme: () => void;
  openShortcuts: () => void;
}

/** Everything the command palette lists: actions, pages and projects. */
export function getPaletteGroups({
  inProject,
  projects,
  go,
  createSomething,
  toggleTheme,
  openShortcuts,
}: PaletteOptions): PaletteGroup[] {
  return [
    {
      heading: 'Actions',
      items: [
        ...(inProject
          ? [{ id: 'new-task', label: 'New task', icon: ListPlus, shortcut: 'C', onSelect: createSomething }]
          : []),
        { id: 'new-project', label: 'New project', icon: FolderPlus, onSelect: () => go('/projects?new=1') },
        { id: 'theme', label: 'Toggle dark mode', icon: MoonStar, keywords: ['theme', 'light'], onSelect: toggleTheme },
        { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard, shortcut: '?', onSelect: openShortcuts },
      ],
    },
    {
      heading: 'Go to',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          keywords: ['home'],
          shortcut: 'G D',
          onSelect: () => go('/dashboard'),
        },
        { id: 'projects', label: 'Projects', icon: FolderKanban, shortcut: 'G P', onSelect: () => go('/projects') },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          shortcut: 'G N',
          onSelect: () => go('/notifications'),
        },
        {
          id: 'account',
          label: 'Account',
          icon: UserRound,
          keywords: ['profile', 'password'],
          onSelect: () => go('/account'),
        },
      ],
    },
    {
      heading: 'Projects',
      items: projects.map((project) => ({
        id: project.id,
        label: project.name,
        icon: FolderKanban,
        onSelect: () => go(`/projects/${project.id}/board`),
      })),
    },
  ];
}
