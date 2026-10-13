import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useFetchData } from '@/hooks/api-hooks';
import { useAuthStore } from '@/store/zustand/auth';
import type { Notification } from '@/types/notification';
import type { Paginated } from '@/types/common';
import type { Project } from '@/types/project';

type NotificationPage = Paginated<Notification>;

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

/** Active projects for the command palette. Loads only while the palette is open. */
export const usePaletteProjects = (enabled: boolean) =>
  useFetchData<Paginated<Project>>({
    path: 'projects',
    queryKey: ['projects', 'palette'],
    filterData: { status: 'ACTIVE', limit: 50 },
    enabled,
  });

/** Sign out: tell the API, then always clear the local session and every cached response. */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const finish = () => {
    useAuthStore.getState().clearSession(true);
    queryClient.clear();
  };
  return useApiMutation<void, void>({
    method: 'POST',
    path: 'auth/logout',
    errorToast: false,
    onSuccess: finish,
    onError: finish,
  });
};
