import { db, type MemberRow, type ProjectRow, type TaskRow } from './db';
import type { ApiErrorBody, PageMeta, UserSummary } from '@/types/common';
import type { Project } from '@/types/project';
import type { Comment, Task } from '@/types/task';
import type { Member } from '@/types/member';
import type { Activity } from '@/types/activity';

/* ---------- Routing types ---------- */

/** What every mock handler receives. */
export interface MockContext {
  req: Request;
  /** Values from the path, e.g. `{ projectId: 'prj_web' }`. */
  params: Record<string, string>;
  query: URLSearchParams;
  /** Parsed JSON body (empty object when there is none). */
  body: Record<string, any>;
  /** Signed-in user's id. Empty string on public routes. */
  userId: string;
}

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Path with `:params`, e.g. `/projects/:projectId/tasks`. */
  path: string;
  /** Public routes skip the access-token check. */
  isPublic?: boolean;
  handler: (ctx: MockContext) => Response | Promise<Response>;
}

/* ---------- Responses ---------- */

/** Success response in the API envelope: `{ data, meta? }`. */
export function ok(data: unknown, meta?: PageMeta, status = 200): Response {
  return Response.json(meta ? { data, meta } : { data }, { status });
}

/** Plain JSON response without the envelope (used by auth endpoints). */
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/** Empty 204 response. */
export function noContent(): Response {
  return new Response(null, { status: 204 });
}

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
};

/** Error response in the API error format. */
export function fail(status: number, code: string, message: string, details: ApiErrorBody['details'] = []): Response {
  const body: ApiErrorBody = { statusCode: status, error: STATUS_TEXT[status] ?? 'Error', message, code, details };
  return Response.json(body, { status });
}

export const notFound = (what = 'Resource') => fail(404, 'NOT_FOUND', `${what} not found`);
export const forbidden = () => fail(403, 'FORBIDDEN', "You don't have permission to do that");

/** 400 error for one invalid field. */
export const invalid = (field: string, message: string) => fail(400, 'VALIDATION_ERROR', message, [{ field, message }]);

/* ---------- Auth tokens ---------- */

export const REFRESH_COOKIE = 'tf_mock_refresh';
const ACCESS_TOKEN_MINUTES = 15;

/** Make a fake access token: `mock.<userId>.<expiresAt>`. */
export function makeAccessToken(userId: string): string {
  return `mock.${userId}.${Date.now() + ACCESS_TOKEN_MINUTES * 60_000}`;
}

/** Read the user id from the `Authorization: Bearer` header. Null when missing or expired. */
export function userIdFromToken(req: Request): string | null {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const [prefix, userId, expiresAt] = token.split('.');
  if (prefix !== 'mock' || !userId || Number(expiresAt) < Date.now()) return null;
  return db.users.some((u) => u.id === userId) ? userId : null;
}

/** Read the user id from the refresh cookie. */
export function userIdFromRefreshCookie(req: Request): string | null {
  const cookie = req.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`${REFRESH_COOKIE}=([^;]+)`));
  const userId = match?.[1] ?? null;
  return userId && db.users.some((u) => u.id === userId) ? userId : null;
}

/** Set-Cookie value that stores (or clears) the refresh cookie. */
export function refreshCookie(userId: string | null): string {
  const maxAge = userId ? 7 * 24 * 3600 : 0;
  return `${REFRESH_COOKIE}=${userId ?? ''}; Path=/api/mock; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

/* ---------- Lookups ---------- */

/** The user's membership in a project, or undefined when they are not a member. */
export function findMembership(projectId: string, userId: string): MemberRow | undefined {
  return db.members.find((m) => m.projectId === projectId && m.userId === userId);
}

/** True when the task is past its due date and not done. */
export function isOverdue(task: TaskRow): boolean {
  return !!task.dueDate && task.status !== 'DONE' && Date.parse(task.dueDate) < Date.now();
}

/** Ids of every project the user belongs to. */
export function myProjectIds(userId: string): string[] {
  return db.members.filter((m) => m.userId === userId).map((m) => m.projectId);
}

/** Add an entry to the project activity log. */
export function logActivity(projectId: string, actorId: string, action: string, message: string): void {
  db.activity.push({
    id: `act_${Math.random().toString(36).slice(2, 10)}`,
    projectId,
    actorId,
    action,
    message,
    createdAt: new Date().toISOString(),
  });
}

/* ---------- Row → API object ---------- */

/** Small public user object. */
export function toUserSummary(userId: string): UserSummary {
  const user = db.users.find((u) => u.id === userId);
  return {
    id: userId,
    name: user?.name ?? 'Deleted user',
    email: user?.email ?? '',
    avatarUrl: user?.avatarUrl ?? null,
  };
}

/** Project with counts and the current user's role. */
export function toProject(row: ProjectRow, userId: string): Project {
  const members = db.members.filter((m) => m.projectId === row.id);
  const tasks = db.tasks.filter((t) => t.projectId === row.id);
  return {
    ...row,
    myRole: findMembership(row.id, userId)?.role ?? 'MEMBER',
    memberCount: members.length,
    membersPreview: members.slice(0, 4).map((m) => toUserSummary(m.userId)),
    taskCount: tasks.length,
    doneCount: tasks.filter((t) => t.status === 'DONE').length,
    overdueCount: tasks.filter(isOverdue).length,
  };
}

/** Task with nested assignee, creator and labels. */
export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    position: row.position,
    dueDate: row.dueDate,
    assignee: row.assigneeId ? toUserSummary(row.assigneeId) : null,
    creator: toUserSummary(row.creatorId),
    labels: db.labels.filter((l) => row.labelIds.includes(l.id)),
    commentCount: db.comments.filter((c) => c.taskId === row.id).length,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Membership with nested user. */
export function toMember(row: MemberRow): Member {
  return { id: row.id, projectId: row.projectId, role: row.role, joinedAt: row.joinedAt, user: toUserSummary(row.userId) };
}

/** Comment with nested author. */
export function toComment(row: { id: string; taskId: string; authorId: string; body: string; createdAt: string; updatedAt: string }): Comment {
  return { id: row.id, taskId: row.taskId, body: row.body, author: toUserSummary(row.authorId), createdAt: row.createdAt, updatedAt: row.updatedAt };
}

/** Activity entry with nested actor and project name. */
export function toActivity(row: { id: string; projectId: string; actorId: string; action: string; message: string; createdAt: string }): Activity {
  const project = db.projects.find((p) => p.id === row.projectId);
  return { ...row, projectName: project?.name ?? '', actor: toUserSummary(row.actorId) };
}

/* ---------- Lists ---------- */

/** Cut one page out of a list and build the `meta` object. Default 10 per page, max 100. */
export function paginate<T>(list: T[], query: URLSearchParams): { data: T[]; meta: PageMeta } {
  const limit = Math.min(Math.max(Number(query.get('limit')) || 10, 1), 100);
  const total = list.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(Math.max(Number(query.get('page')) || 1, 1), totalPages);
  const data = list.slice((page - 1) * limit, page * limit);
  return { data, meta: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

/** Newest first, by `createdAt`. */
export const byNewest = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);
