'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, FolderKanban, FolderPlus, Keyboard, LayoutDashboard, ListPlus, MoonStar, UserRound } from 'lucide-react';
import { CommandPalette, type PaletteGroup } from '@/components/features/command-palette/command-palette';
import { ShortcutsDialog } from '@/components/features/command-palette/shortcuts-dialog';
import { useHotkeys } from '@/hooks/ui/use-hotkeys';
import { useThemeMode } from '@/hooks/ui/use-theme';
import { useUiStore } from '@/store/zustand/ui';
import { usePaletteProjects } from './service';

/** Project id from a URL like `/projects/prj_1/board`, or null outside a project. */
const projectIdFrom = (pathname: string) => pathname.match(/^\/projects\/([^/]+)/)?.[1] ?? null;

/** Command palette, shortcuts help, and the global keyboard shortcuts. */
export default function CommandCenterContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useThemeMode();
  const { isCommandOpen, isShortcutsOpen, setCommandOpen, setShortcutsOpen } = useUiStore();
  const projects = usePaletteProjects(isCommandOpen).data?.data ?? [];
  const currentProjectId = projectIdFrom(pathname);

  /** "New task" inside a project, otherwise "New project". */
  const createSomething = () => {
    if (currentProjectId) router.push(`${pathname}?newTask=TODO`);
    else router.push('/projects?new=1');
  };

  useHotkeys({
    'mod+k': () => setCommandOpen(!useUiStore.getState().isCommandOpen),
    c: createSomething,
    '/': () => document.querySelector<HTMLInputElement>('main input[type="search"]')?.focus(),
    'g d': () => router.push('/dashboard'),
    'g p': () => router.push('/projects'),
    'g n': () => router.push('/notifications'),
    '?': () => setShortcutsOpen(true),
  });

  const groups: PaletteGroup[] = [
    {
      heading: 'Actions',
      items: [
        ...(currentProjectId
          ? [{ id: 'new-task', label: 'New task', icon: ListPlus, shortcut: 'C', onSelect: createSomething }]
          : []),
        { id: 'new-project', label: 'New project', icon: FolderPlus, onSelect: () => router.push('/projects?new=1') },
        { id: 'theme', label: 'Toggle dark mode', icon: MoonStar, keywords: ['theme', 'light'], onSelect: toggleTheme },
        { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard, shortcut: '?', onSelect: () => setShortcutsOpen(true) },
      ],
    },
    {
      heading: 'Go to',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: ['home'], shortcut: 'G D', onSelect: () => router.push('/dashboard') },
        { id: 'projects', label: 'Projects', icon: FolderKanban, shortcut: 'G P', onSelect: () => router.push('/projects') },
        { id: 'notifications', label: 'Notifications', icon: Bell, shortcut: 'G N', onSelect: () => router.push('/notifications') },
        { id: 'account', label: 'Account', icon: UserRound, keywords: ['profile', 'password'], onSelect: () => router.push('/account') },
      ],
    },
    {
      heading: 'Projects',
      items: projects.map((project) => ({
        id: project.id,
        label: project.name,
        icon: FolderKanban,
        onSelect: () => router.push(`/projects/${project.id}/board`),
      })),
    },
  ];

  return (
    <>
      <CommandPalette open={isCommandOpen} onOpenChange={setCommandOpen} groups={groups} />
      <ShortcutsDialog open={isShortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
