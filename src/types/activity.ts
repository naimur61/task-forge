import type { UserSummary } from './common';

/** One entry in a project's activity timeline. */
export interface Activity {
  id: string;
  projectId: string;
  projectName: string;
  actor: UserSummary;
  /** What happened, e.g. `task.created`, `member.added`. */
  action: string;
  /** Short readable text, e.g. `moved "Login page" to Done`. */
  message: string;
  createdAt: string;
}
