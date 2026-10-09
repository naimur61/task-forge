import { useFetchData } from '@/hooks/api-hooks';
import type { ApiResponse, Paginated } from '@/types/common';
import type { DashboardSummary, MyTask } from '@/types/dashboard';

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  myTasks: (overdue: boolean) => ['dashboard', 'my-tasks', { overdue }] as const,
};

/** Overview numbers and charts for the current user. */
export const useDashboardSummary = () =>
  useFetchData<ApiResponse<DashboardSummary>>({ path: 'dashboard/summary', queryKey: dashboardKeys.summary });

/** Open tasks assigned to me, soonest due first. */
export const useMyTasks = (overdue = false) =>
  useFetchData<Paginated<MyTask>>({
    path: 'dashboard/my-tasks',
    queryKey: dashboardKeys.myTasks(overdue),
    filterData: { overdue: overdue || undefined, limit: 6 },
  });
