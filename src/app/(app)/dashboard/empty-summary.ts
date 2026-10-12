import type { DashboardSummary } from '@/types/dashboard';

/** Zero values shown under the skeleton while the real summary is loading. */
export const EMPTY_SUMMARY: DashboardSummary = {
  projects: { total: 0, active: 0, archived: 0 },
  tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0, highPriority: 0, assignedToMe: 0 },
  byStatus: [],
  byPriority: [],
  completionTrend: [],
  recentActivity: [],
};
