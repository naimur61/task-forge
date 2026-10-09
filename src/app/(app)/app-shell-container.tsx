'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/common/auth/require-auth';
import GlobalLoader from '@/components/common/global-loader/global-loader';
import { AppLayout } from '@/components/layouts/app-layout';
import { NotificationBell } from '@/components/features/notifications/notification-bell';
import type { Notification } from '@/types/notification';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from './service';

/** Signed-in shell: waits for the session, then shows sidebar + top bar around the page. */
export default function AppShellContainer({ children }: { children: ReactNode }) {
  return (
    <RequireAuth fallback={<GlobalLoader />}>
      <Shell>{children}</Shell>
    </RequireAuth>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const notifications = useNotifications(1, 10);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const openNotification = (notification: Notification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <AppLayout
      headerActions={
        <NotificationBell
          notifications={notifications.data?.data ?? []}
          unread={notifications.data?.meta.unread ?? 0}
          isLoading={notifications.isPending}
          onOpen={openNotification}
          onMarkAllRead={() => markAllRead.mutate()}
        />
      }
    >
      {children}
    </AppLayout>
  );
}
