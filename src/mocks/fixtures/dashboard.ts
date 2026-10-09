import type { DashboardSummary, MyTask } from '@/types/dashboard';
import { FIXTURE_USER, fixtureTask } from './tasks';

/** Sample dashboard data. Only used by boneyard to capture skeleton shapes. */
export const DASHBOARD_FIXTURE: DashboardSummary = {
  projects: { total: 4, active: 3, archived: 1 },
  tasks: { total: 43, completed: 9, inProgress: 10, overdue: 7, highPriority: 14, assignedToMe: 8 },
  byStatus: [
    { status: 'TODO', count: 15 },
    { status: 'IN_PROGRESS', count: 10 },
    { status: 'IN_REVIEW', count: 9 },
    { status: 'DONE', count: 9 },
  ],
  byPriority: [
    { priority: 'LOW', count: 10 },
    { priority: 'MEDIUM', count: 14 },
    { priority: 'HIGH', count: 9 },
    { priority: 'URGENT', count: 10 },
  ],
  completionTrend: Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, completed: (i * 7) % 4 })),
  recentActivity: Array.from({ length: 6 }, (_, i) => ({
    id: `act_${i}`,
    projectId: 'prj_web',
    projectName: 'Website Redesign',
    actor: FIXTURE_USER,
    action: 'task.created',
    message: 'moved "Design new homepage hero" to Done',
    createdAt: '2026-10-09T09:00:00.000Z',
  })),
};

/** Sample "My tasks" rows. */
export const MY_TASKS_FIXTURE: MyTask[] = Array.from({ length: 5 }, (_, i) => ({
  ...fixtureTask(i),
  projectName: 'Website Redesign',
}));
