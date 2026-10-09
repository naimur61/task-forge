import { useApiMutation, useFetchData } from '@/hooks/api-hooks';
import type { Notification } from '@/types/notification';
import type { PageMeta } from '@/types/common';

/** Notification list response. `meta.unread` is the unread count for the bell badge. */
export interface NotificationPage {
  data: Notification[];
  meta: PageMeta & { unread: number };
}

/** Cache keys for notifications. */
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number, limit: number) => ['notifications', { page, limit }] as const,
};

/** One page of the current user's notifications (newest first). */
export const useNotifications = (page: number, limit: number) =>
  useFetchData<NotificationPage>({
    path: 'notifications',
    queryKey: notificationKeys.list(page, limit),
    filterData: { page, limit },
    keepPreviousData: true,
  });

/** Mark one notification as read. */
export const useMarkNotificationRead = () =>
  useApiMutation<unknown, string>({
    method: 'PATCH',
    path: (id) => `notifications/${id}/read`,
    toBody: () => undefined,
    invalidate: [notificationKeys.all],
  });

/** Mark every notification as read. */
export const useMarkAllNotificationsRead = () =>
  useApiMutation<unknown, void>({
    method: 'POST',
    path: 'notifications/read-all',
    toBody: () => undefined,
    invalidate: [notificationKeys.all],
    successMessage: 'All caught up',
  });
