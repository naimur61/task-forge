import type { Activity } from './activity';
import type { Task, TaskPriority, TaskStatus } from './task';

/** A task in "My tasks", with its project name. */
export type MyTask = Task & { projectName: string };

/** Overview numbers for the current user's projects. */
export interface DashboardSummary {
  projects: { total: number; active: number; archived: number };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    highPriority: number;
    assignedToMe: number;
  };
  byStatus: { status: TaskStatus; count: number }[];
  byPriority: { priority: TaskPriority; count: number }[];
  /** Tasks completed per day for the last 14 days. */
  completionTrend: { date: string; completed: number }[];
  recentActivity: Activity[];
}
