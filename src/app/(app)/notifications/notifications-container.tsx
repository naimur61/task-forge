'use client';

import { useRouter } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { BellOff, CheckCheck } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorState } from '@/components/common/error-state/error-state';
import { PageHeader } from '@/components/common/page-header/page-header';
import { Pagination } from '@/components/common/pagination/pagination';
import { NotificationList } from '@/components/features/notifications/notification-list';
import { useUrlState } from '@/hooks/ui/use-url-state';
import type { Notification } from '@/types/notification';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../service';

export default function NotificationsContainer() {
  const router = useRouter();
  const url = useUrlState();
  const page = Number(url.get('page') ?? 1);

  const notificationsQuery = useNotifications(page, 15);
  const notifications = notificationsQuery.data?.data ?? [];
  const meta = notificationsQuery.data?.meta;
  const unread = notifications.filter((n) => !n.readAt).length;
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const openNotification = (notification: Notification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : 'Updates about your tasks and projects.'}
        actions={
          !!unread && (
            <ActionButton variant="outline" icon={<CheckCheck />} isPending={markAllRead.isPending} handleOpen={() => markAllRead.mutate()}>
              Mark all as read
            </ActionButton>
          )
        }
      />

      {notificationsQuery.isError ? (
        <ErrorState error={notificationsQuery.error} onRetry={() => notificationsQuery.refetch()} />
      ) : (
        <Skeleton name="notification-list" loading={notificationsQuery.isPending}>
          {notifications.length === 0 ? (
            <EmptyState icon={BellOff} title="You're all caught up" description="New assignments and comments will show up here." />
          ) : (
            <NotificationList notifications={notifications} onOpen={openNotification} />
          )}
        </Skeleton>
      )}

      {meta && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          setCurrentPage={(next) => url.set({ page: next === 1 ? undefined : next })}
        />
      )}
    </div>
  );
}
