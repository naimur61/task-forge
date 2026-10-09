import type { UserSummary } from './common';
import type { MemberRole } from './project';

/** A user's membership in a project. */
export interface Member {
  id: string;
  projectId: string;
  role: MemberRole;
  joinedAt: string;
  user: UserSummary;
}

/** Body for adding a member. */
export interface AddMemberInput {
  userId: string;
  role: Exclude<MemberRole, 'OWNER'>;
}
