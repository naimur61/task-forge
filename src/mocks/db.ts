import usersJson from './data/users.json';
import projectsJson from './data/projects.json';
import membersJson from './data/members.json';
import labelsJson from './data/labels.json';
import tasksJson from './data/tasks.json';
import commentsJson from './data/comments.json';
import activityJson from './data/activity.json';
import notificationsJson from './data/notifications.json';
import type { MemberRole, ProjectStatus } from '@/types/project';
import type { TaskPriority, TaskStatus } from '@/types/task';

/* Rows as the fake database stores them (ids instead of nested objects). */

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRow {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export interface LabelRow {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface TaskRow {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
  creatorId: string;
  labelIds: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRow {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRow {
  id: string;
  projectId: string;
  actorId: string;
  action: string;
  message: string;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  userId: string;
  type: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface Db {
  users: UserRow[];
  projects: ProjectRow[];
  members: MemberRow[];
  labels: LabelRow[];
  tasks: TaskRow[];
  comments: CommentRow[];
  activity: ActivityRow[];
  notifications: NotificationRow[];
}

/** The seed JSON was written for this day. Dates are moved forward so "overdue" stays realistic. */
const SEED_DATE = Date.parse('2026-10-10T09:00:00.000Z');
const DATE_FIELDS = ['createdAt', 'updatedAt', 'dueDate', 'completedAt', 'joinedAt', 'readAt'];

/** Copy rows and shift every date field by the days passed since the seed date. */
function shiftDates<T extends object>(rows: T[]): T[] {
  const days = Math.floor((Date.now() - SEED_DATE) / 86_400_000);
  const shift = days * 86_400_000;
  return rows.map((row) => {
    const copy = { ...row } as Record<string, unknown>;
    for (const field of DATE_FIELDS) {
      const value = copy[field];
      if (typeof value === 'string') copy[field] = new Date(Date.parse(value) + shift).toISOString();
    }
    if (Array.isArray(copy.labelIds)) copy.labelIds = [...copy.labelIds];
    return copy as T;
  });
}

/** Build a fresh database from the seed JSON. */
function createDb(): Db {
  return {
    users: shiftDates(usersJson as UserRow[]),
    projects: shiftDates(projectsJson as ProjectRow[]),
    members: shiftDates(membersJson as MemberRow[]),
    labels: shiftDates(labelsJson as LabelRow[]),
    tasks: shiftDates(tasksJson as TaskRow[]),
    comments: shiftDates(commentsJson as CommentRow[]),
    activity: shiftDates(activityJson as ActivityRow[]),
    notifications: shiftDates(notificationsJson as NotificationRow[]),
  };
}

// Kept on globalThis so data survives hot reloads in dev. Restarting the server resets it.
const globalForDb = globalThis as unknown as { taskforgeMockDb?: Db };

/** The in-memory database. Changes last until the dev server restarts. */
export const db: Db = (globalForDb.taskforgeMockDb ??= createDb());

/** Make a new unique id, e.g. `tsk_k3j9x2`. */
export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Current time as an ISO string. */
export const now = () => new Date().toISOString();
