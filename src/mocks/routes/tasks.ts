import { can, canDeleteTask, canEditTask } from '@/lib/permissions';
import type { TaskPriority, TaskStatus } from '@/types/task';
import { db, newId, now, type TaskRow } from '../db';
import {
  byNewest,
  fail,
  findMembership,
  forbidden,
  invalid,
  isOverdue,
  logActivity,
  noContent,
  notFound,
  ok,
  paginate,
  toComment,
  toTask,
  type MockContext,
  type MockRoute,
} from '../helpers';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const PRIORITY_ORDER: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
const STATUS_LABEL: Record<TaskStatus, string> = { TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' };

/** Find the project + membership + task for a task route. Returns an error response when not allowed. */
function loadTask({ userId, params }: MockContext) {
  const member = findMembership(params.projectId, userId);
  const task = db.tasks.find((t) => t.id === params.taskId && t.projectId === params.projectId);
  if (!member || !task) return { error: notFound('Task') };
  return { member, task };
}

/** Archived projects are read-only. */
function isArchived(projectId: string): boolean {
  return db.projects.find((p) => p.id === projectId)?.status === 'ARCHIVED';
}

/** Check task fields. Returns an error response or null. */
function validateTask(body: Record<string, any>, projectId: string, partial: boolean): Response | null {
  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? '').trim();
    if (!title) return invalid('title', 'Title is required');
    if (title.length > 200) return invalid('title', 'Title must be at most 200 characters');
  }
  if (body.description && String(body.description).length > 5000) {
    return invalid('description', 'Description must be at most 5000 characters');
  }
  if (body.status !== undefined && !STATUSES.includes(body.status)) return invalid('status', 'Invalid status');
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) return invalid('priority', 'Invalid priority');
  if (body.dueDate && Number.isNaN(Date.parse(body.dueDate))) return invalid('dueDate', 'Invalid date');
  if (body.assigneeId && !findMembership(projectId, body.assigneeId)) {
    return fail(422, 'ASSIGNEE_NOT_MEMBER', 'Assignee is not a project member');
  }
  return null;
}

/** Position for the end of a column. */
function lastPosition(projectId: string, status: TaskStatus): number {
  const column = db.tasks.filter((t) => t.projectId === projectId && t.status === status);
  return column.reduce((max, t) => Math.max(max, t.position), 0) + 1000;
}

/** Apply the list filters from the query string. */
function filterTasks(tasks: TaskRow[], query: URLSearchParams, userId: string): TaskRow[] {
  const search = query.get('search')?.trim().toLowerCase() ?? '';
  const statuses = query.getAll('status');
  const priorities = query.getAll('priority');
  const labelIds = query.getAll('labelId');
  const assignee = query.get('assigneeId');
  const overdue = query.get('overdue') === 'true';

  return tasks.filter((t) => {
    if (search && !`${t.title} ${t.description ?? ''}`.toLowerCase().includes(search)) return false;
    if (statuses.length && !statuses.includes(t.status)) return false;
    if (priorities.length && !priorities.includes(t.priority)) return false;
    if (labelIds.length && !labelIds.some((id) => t.labelIds.includes(id))) return false;
    if (assignee === 'me' && t.assigneeId !== userId) return false;
    if (assignee === 'unassigned' && t.assigneeId !== null) return false;
    if (assignee && assignee !== 'me' && assignee !== 'unassigned' && t.assigneeId !== assignee) return false;
    if (overdue && !isOverdue(t)) return false;
    return true;
  });
}

/** Sort by the whitelisted `sortBy` field. */
function sortTasks(tasks: TaskRow[], sortBy: string | null, order: string | null): TaskRow[] {
  const direction = order === 'asc' ? 1 : -1;
  const value = (t: TaskRow): string | number => {
    if (sortBy === 'priority') return PRIORITY_ORDER[t.priority];
    if (sortBy === 'title') return t.title.toLowerCase();
    if (sortBy === 'dueDate') return t.dueDate ?? '9999';
    if (sortBy === 'updatedAt') return t.updatedAt;
    return t.createdAt;
  };
  return [...tasks].sort((a, b) => (value(a) > value(b) ? direction : value(a) < value(b) ? -direction : 0));
}

export const taskRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/projects/:projectId/tasks',
    handler: ({ userId, params, query }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      const tasks = db.tasks.filter((t) => t.projectId === params.projectId);
      const sorted = sortTasks(filterTasks(tasks, query, userId), query.get('sortBy'), query.get('order'));
      const page = paginate(sorted, query);
      return ok(page.data.map(toTask), page.meta);
    },
  },
  {
    method: 'GET',
    path: '/projects/:projectId/board',
    handler: ({ userId, params, query }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      const tasks = filterTasks(
        db.tasks.filter((t) => t.projectId === params.projectId),
        query,
        userId,
      );
      const board = Object.fromEntries(
        STATUSES.map((status) => [
          status,
          tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position).map(toTask),
        ]),
      );
      return ok(board);
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/tasks',
    handler: ({ userId, params, body }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      if (isArchived(params.projectId)) return fail(422, 'PROJECT_ARCHIVED', 'Archived projects are read-only');
      const error = validateTask(body, params.projectId, false);
      if (error) return error;
      const status: TaskStatus = body.status ?? 'TODO';
      const task: TaskRow = {
        id: newId('tsk'),
        projectId: params.projectId,
        title: String(body.title).trim(),
        description: body.description ? String(body.description) : null,
        status,
        priority: body.priority ?? 'MEDIUM',
        position: lastPosition(params.projectId, status),
        dueDate: body.dueDate || null,
        assigneeId: body.assigneeId || null,
        creatorId: userId,
        labelIds: Array.isArray(body.labelIds) ? body.labelIds : [],
        completedAt: status === 'DONE' ? now() : null,
        createdAt: now(),
        updatedAt: now(),
      };
      db.tasks.push(task);
      logActivity(params.projectId, userId, 'task.created', `created "${task.title}"`);
      return ok(toTask(task), undefined, 201);
    },
  },
  {
    method: 'GET',
    path: '/projects/:projectId/tasks/:taskId',
    handler: (ctx) => {
      const { error, task } = loadTask(ctx);
      return error ?? ok(toTask(task));
    },
  },
  {
    method: 'PATCH',
    path: '/projects/:projectId/tasks/:taskId',
    handler: (ctx) => {
      const { error, task, member } = loadTask(ctx);
      if (error) return error;
      const { body, userId } = ctx;
      if (isArchived(task.projectId)) return fail(422, 'PROJECT_ARCHIVED', 'Archived projects are read-only');
      if (!canEditTask(member.role, userId, task)) return forbidden();
      const invalidBody = validateTask(body, task.projectId, true);
      if (invalidBody) return invalidBody;

      if (body.title !== undefined) task.title = String(body.title).trim();
      if (body.description !== undefined) task.description = body.description || null;
      if (body.priority !== undefined) task.priority = body.priority;
      if (body.dueDate !== undefined) task.dueDate = body.dueDate || null;
      if (body.assigneeId !== undefined) task.assigneeId = body.assigneeId || null;
      if (Array.isArray(body.labelIds)) task.labelIds = body.labelIds;
      if (body.status !== undefined && body.status !== task.status) {
        task.status = body.status;
        task.position = lastPosition(task.projectId, body.status);
        task.completedAt = body.status === 'DONE' ? now() : null;
        logActivity(task.projectId, userId, 'task.moved', `moved "${task.title}" to ${STATUS_LABEL[task.status]}`);
      } else {
        logActivity(task.projectId, userId, 'task.updated', `updated "${task.title}"`);
      }
      task.updatedAt = now();
      return ok(toTask(task));
    },
  },
  {
    method: 'PATCH',
    path: '/projects/:projectId/tasks/:taskId/move',
    handler: (ctx) => {
      const { error, task, member } = loadTask(ctx);
      if (error) return error;
      const { body, userId } = ctx;
      if (isArchived(task.projectId)) return fail(422, 'PROJECT_ARCHIVED', 'Archived projects are read-only');
      if (!canEditTask(member.role, userId, task)) return forbidden();
      if (!STATUSES.includes(body.status)) return invalid('status', 'Invalid status');

      // New position: halfway between the task we drop after and the one below it.
      const column = db.tasks
        .filter((t) => t.projectId === task.projectId && t.status === body.status && t.id !== task.id)
        .sort((a, b) => a.position - b.position);
      const afterIndex = body.afterId ? column.findIndex((t) => t.id === body.afterId) : -1;
      const before = afterIndex >= 0 ? column[afterIndex].position : 0;
      const after = column[afterIndex + 1]?.position ?? before + 2000;

      const statusChanged = task.status !== body.status;
      task.position = (before + after) / 2;
      task.status = body.status;
      if (statusChanged) {
        task.completedAt = task.status === 'DONE' ? now() : null;
        logActivity(task.projectId, userId, 'task.moved', `moved "${task.title}" to ${STATUS_LABEL[task.status]}`);
      }
      task.updatedAt = now();
      return ok(toTask(task));
    },
  },
  {
    method: 'DELETE',
    path: '/projects/:projectId/tasks/:taskId',
    handler: (ctx) => {
      const { error, task, member } = loadTask(ctx);
      if (error) return error;
      if (!canDeleteTask(member.role, ctx.userId, task)) return forbidden();
      db.tasks = db.tasks.filter((t) => t.id !== task.id);
      db.comments = db.comments.filter((c) => c.taskId !== task.id);
      logActivity(task.projectId, ctx.userId, 'task.deleted', `deleted "${task.title}"`);
      return noContent();
    },
  },

  /* ---------- Comments ---------- */
  {
    method: 'GET',
    path: '/projects/:projectId/tasks/:taskId/comments',
    handler: (ctx) => {
      const { error, task } = loadTask(ctx);
      if (error) return error;
      const list = db.comments.filter((c) => c.taskId === task.id).sort((a, b) => -byNewest(a, b));
      return ok(list.map(toComment));
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/tasks/:taskId/comments',
    handler: (ctx) => {
      const { error, task } = loadTask(ctx);
      if (error) return error;
      const body = String(ctx.body.body ?? '').trim();
      if (!body) return invalid('body', 'Comment cannot be empty');
      if (body.length > 2000) return invalid('body', 'Comment must be at most 2000 characters');
      const comment = { id: newId('cmt'), taskId: task.id, authorId: ctx.userId, body, createdAt: now(), updatedAt: now() };
      db.comments.push(comment);
      logActivity(task.projectId, ctx.userId, 'comment.added', `commented on "${task.title}"`);
      return ok(toComment(comment), undefined, 201);
    },
  },
  {
    method: 'PATCH',
    path: '/projects/:projectId/tasks/:taskId/comments/:commentId',
    handler: (ctx) => {
      const { error, task } = loadTask(ctx);
      if (error) return error;
      const comment = db.comments.find((c) => c.id === ctx.params.commentId && c.taskId === task.id);
      if (!comment) return notFound('Comment');
      if (comment.authorId !== ctx.userId) return forbidden();
      const body = String(ctx.body.body ?? '').trim();
      if (!body) return invalid('body', 'Comment cannot be empty');
      comment.body = body;
      comment.updatedAt = now();
      return ok(toComment(comment));
    },
  },
  {
    method: 'DELETE',
    path: '/projects/:projectId/tasks/:taskId/comments/:commentId',
    handler: (ctx) => {
      const { error, task, member } = loadTask(ctx);
      if (error) return error;
      const comment = db.comments.find((c) => c.id === ctx.params.commentId && c.taskId === task.id);
      if (!comment) return notFound('Comment');
      if (comment.authorId !== ctx.userId && !can(member.role, 'comment.deleteAny')) return forbidden();
      db.comments = db.comments.filter((c) => c.id !== comment.id);
      return noContent();
    },
  },

  /* ---------- Labels ---------- */
  {
    method: 'GET',
    path: '/projects/:projectId/labels',
    handler: ({ userId, params }) => {
      if (!findMembership(params.projectId, userId)) return notFound('Project');
      return ok(db.labels.filter((l) => l.projectId === params.projectId));
    },
  },
  {
    method: 'POST',
    path: '/projects/:projectId/labels',
    handler: ({ userId, params, body }) => {
      const member = findMembership(params.projectId, userId);
      if (!member) return notFound('Project');
      if (!can(member.role, 'label.manage')) return forbidden();
      const name = String(body.name ?? '').trim();
      if (!name) return invalid('name', 'Name is required');
      if (db.labels.some((l) => l.projectId === params.projectId && l.name.toLowerCase() === name.toLowerCase())) {
        return fail(409, 'LABEL_EXISTS', 'A label with this name already exists');
      }
      const label = { id: newId('lbl'), projectId: params.projectId, name, color: String(body.color || '#6366f1') };
      db.labels.push(label);
      return ok(label, undefined, 201);
    },
  },
];
