import type { DashboardSummary } from '@/types/dashboard';
import type { TaskPriority, TaskStatus } from '@/types/task';
import { db, now } from '../db';
import { byNewest, isOverdue, myProjectIds, notFound, ok, paginate, toActivity, toTask, type MockRoute } from '../helpers';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/** Date as `YYYY-MM-DD`. */
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export const dashboardRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/dashboard/summary',
    handler: ({ userId }) => {
      const projectIds = myProjectIds(userId);
      const projects = db.projects.filter((p) => projectIds.includes(p.id));
      const tasks = db.tasks.filter((t) => projectIds.includes(t.projectId));

      // Completed tasks per day for the last 14 days (oldest first).
      const trend = Array.from({ length: 14 }, (_, i) => {
        const date = dayKey(new Date(Date.now() - (13 - i) * 86_400_000));
        const completed = tasks.filter((t) => t.completedAt?.slice(0, 10) === date).length;
        return { date, completed };
      });

      const summary: DashboardSummary = {
        projects: {
          total: projects.length,
          active: projects.filter((p) => p.status === 'ACTIVE').length,
          archived: projects.filter((p) => p.status === 'ARCHIVED').length,
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'DONE').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          overdue: tasks.filter(isOverdue).length,
          highPriority: tasks.filter((t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'DONE').length,
          assignedToMe: tasks.filter((t) => t.assigneeId === userId && t.status !== 'DONE').length,
        },
        byStatus: STATUSES.map((status) => ({ status, count: tasks.filter((t) => t.status === status).length })),
        byPriority: PRIORITIES.map((priority) => ({ priority, count: tasks.filter((t) => t.priority === priority).length })),
        completionTrend: trend,
        recentActivity: db.activity
          .filter((a) => projectIds.includes(a.projectId))
          .sort(byNewest)
          .slice(0, 8)
          .map(toActivity),
      };
      return ok(summary);
    },
  },
  {
    method: 'GET',
    path: '/dashboard/my-tasks',
    handler: ({ userId, query }) => {
      const projectIds = myProjectIds(userId);
      const overdueOnly = query.get('overdue') === 'true';
      const list = db.tasks
        .filter((t) => projectIds.includes(t.projectId) && t.assigneeId === userId && t.status !== 'DONE')
        .filter((t) => !overdueOnly || isOverdue(t))
        // Soonest due first; tasks without a due date go last.
        .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));
      const page = paginate(list, query);
      return ok(
        page.data.map((t) => ({ ...toTask(t), projectName: db.projects.find((p) => p.id === t.projectId)?.name ?? '' })),
        page.meta,
      );
    },
  },

  /* ---------- Notifications ---------- */
  {
    method: 'GET',
    path: '/notifications',
    handler: ({ userId, query }) => {
      const list = db.notifications.filter((n) => n.userId === userId).sort(byNewest);
      const unread = list.filter((n) => !n.readAt).length;
      const page = paginate(list, query);
      // `unread` rides along in meta so the bell badge needs only one request.
      return Response.json({ data: page.data.map(({ userId: _userId, ...n }) => n), meta: { ...page.meta, unread } });
    },
  },
  {
    method: 'PATCH',
    path: '/notifications/:id/read',
    handler: ({ userId, params }) => {
      const notification = db.notifications.find((n) => n.id === params.id && n.userId === userId);
      if (!notification) return notFound('Notification');
      notification.readAt ??= now();
      const { userId: _userId, ...rest } = notification;
      return ok(rest);
    },
  },
  {
    method: 'POST',
    path: '/notifications/read-all',
    handler: ({ userId }) => {
      db.notifications.forEach((n) => {
        if (n.userId === userId) n.readAt ??= now();
      });
      return ok({ success: true });
    },
  },
];
