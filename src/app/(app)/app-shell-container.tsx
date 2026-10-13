'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/common/auth/require-auth';
import GlobalLoader from '@/components/common/global-loader/global-loader';
import { AppLayout } from '@/components/layouts/app-layout';
import { UserMenu } from '@/components/layouts/user-menu';
import { NotificationBell } from '@/components/features/notifications/notification-bell';
import { CommandPalette } from '@/components/features/command-palette/command-palette';
import { PaletteTrigger } from '@/components/features/command-palette/palette-trigger';
import { getPaletteGroups } from '@/components/features/command-palette/palette-groups';
import { ShortcutsDialog } from '@/components/features/command-palette/shortcuts-dialog';
import { useHotkeys } from '@/hooks/ui/use-hotkeys';
import { useThemeMode } from '@/hooks/ui/use-theme';
import { useUiStore } from '@/store/zustand/ui';
import type { Notification } from '@/types/notification';
import {
  useLogout,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  usePaletteProjects,
} from './service';

/** Signed-in shell: waits for the session, then shows sidebar + top bar around the page. */
export default function AppShellContainer({ children }: { children: ReactNode }) {
  return (
    <RequireAuth fallback={<GlobalLoader />}>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

/** Top bar, notifications, command palette and the global keyboard shortcuts. */
function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleTheme } = useThemeMode();
  const { isCommandOpen, isShortcutsOpen, setCommandOpen, setShortcutsOpen } = useUiStore();
  const notifications = useNotifications(1, 10);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const logout = useLogout();
  const projects = usePaletteProjects(isCommandOpen).data?.data ?? [];
  const inProject = pathname.startsWith('/projects/');

  const openNotification = (notification: Notification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  };

  /** "New task" inside a project, otherwise "New project". */
  const createSomething = () => router.push(inProject ? `${pathname}?newTask=TODO` : '/projects?new=1');

  useHotkeys({
    'mod+k': () => setCommandOpen(!useUiStore.getState().isCommandOpen),
    c: createSomething,
    '/': () => document.querySelector<HTMLInputElement>('main input[type="search"]')?.focus(),
    'g d': () => router.push('/dashboard'),
    'g p': () => router.push('/projects'),
    'g n': () => router.push('/notifications'),
    '?': () => setShortcutsOpen(true),
  });

  const groups = getPaletteGroups({
    inProject,
    projects,
    go: router.push,
    createSomething,
    toggleTheme,
    openShortcuts: () => setShortcutsOpen(true),
  });

  return (
    <AppLayout
      headerActions={
        <>
          <PaletteTrigger onOpen={() => setCommandOpen(true)} />
          <NotificationBell
            notifications={notifications.data?.data ?? []}
            unread={(notifications.data?.data ?? []).filter((n) => !n.readAt).length}
            isLoading={notifications.isPending}
            onOpen={openNotification}
            onMarkAllRead={() => markAllRead.mutate()}
          />
          <UserMenu onSignOut={() => logout.mutate()} />
        </>
      }
    >
      {children}
      <CommandPalette open={isCommandOpen} onOpenChange={setCommandOpen} groups={groups} />
      <ShortcutsDialog open={isShortcutsOpen} onOpenChange={setShortcutsOpen} />
    </AppLayout>
  );
}
