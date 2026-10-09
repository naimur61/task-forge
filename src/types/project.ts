import type { UserSummary } from './common';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

/** A project as returned by the API, with numbers for the current user. */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: string;
  /** The current user's role in this project. */
  myRole: MemberRole;
  memberCount: number;
  /** First few members, for the avatar stack. */
  membersPreview: UserSummary[];
  taskCount: number;
  doneCount: number;
  overdueCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Filters for the projects list. */
export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  page: number;
  limit: number;
}

/** Body for creating or editing a project. */
export interface ProjectInput {
  name: string;
  description?: string;
}
