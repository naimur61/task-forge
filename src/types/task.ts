import type { UserSummary } from './common';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskSortBy = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'updatedAt';

export interface Label {
  id: string;
  projectId: string;
  name: string;
  /** Hex color, e.g. `#6366f1`. */
  color: string;
}

/** A task as returned by the API. */
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** Order inside a kanban column (smaller comes first). */
  position: number;
  dueDate: string | null;
  assignee: UserSummary | null;
  creator: UserSummary;
  labels: Label[];
  commentCount: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Filters, sort and page for the task list. All of it lives in the URL. */
export interface TaskFilters {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  /** A user id, `me` or `unassigned`. */
  assigneeId?: string;
  labelId?: string[];
  overdue?: boolean;
  sortBy?: TaskSortBy;
  order?: 'asc' | 'desc';
  page: number;
  limit: number;
}

/** Body for creating or editing a task. */
export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
}

/** Body for moving a task on the kanban board. */
export interface MoveTaskInput {
  status: TaskStatus;
  /** Place the task after this task (null = top of the column). */
  afterId?: string | null;
}

export interface Comment {
  id: string;
  taskId: string;
  body: string;
  author: UserSummary;
  createdAt: string;
  updatedAt: string;
}
