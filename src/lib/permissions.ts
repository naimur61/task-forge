import type { MemberRole } from '@/types/project';

/** Everything a role can be allowed to do inside a project. */
export type ProjectAction =
  | 'project.update'
  | 'project.archive'
  | 'project.delete'
  | 'project.transfer'
  | 'project.leave'
  | 'member.add'
  | 'member.remove'
  | 'member.changeRole'
  | 'task.create'
  | 'task.updateAny'
  | 'task.deleteAny'
  | 'comment.deleteAny'
  | 'label.manage';

/** Which roles may do each action. Mirrors the backend permission matrix. */
const RULES: Record<ProjectAction, MemberRole[]> = {
  'project.update': ['OWNER', 'ADMIN'],
  'project.archive': ['OWNER'],
  'project.delete': ['OWNER'],
  'project.transfer': ['OWNER'],
  'project.leave': ['ADMIN', 'MEMBER'],
  'member.add': ['OWNER', 'ADMIN'],
  'member.remove': ['OWNER', 'ADMIN'],
  'member.changeRole': ['OWNER'],
  'task.create': ['OWNER', 'ADMIN', 'MEMBER'],
  'task.updateAny': ['OWNER', 'ADMIN'],
  'task.deleteAny': ['OWNER', 'ADMIN'],
  'comment.deleteAny': ['OWNER', 'ADMIN'],
  'label.manage': ['OWNER', 'ADMIN'],
};

/** True when `role` may do `action`. UI only hides controls; the API enforces the rule. */
export function can(role: MemberRole | null | undefined, action: ProjectAction): boolean {
  if (!role) return false;
  return RULES[action].includes(role);
}

/** True when the user may edit this task (any task for owner/admin, own or assigned task for member). */
export function canEditTask(
  role: MemberRole | null | undefined,
  userId: string,
  task: { creatorId: string; assigneeId: string | null },
): boolean {
  if (can(role, 'task.updateAny')) return true;
  return !!role && (task.creatorId === userId || task.assigneeId === userId);
}

/** True when the user may delete this task (any task for owner/admin, own created task for member). */
export function canDeleteTask(role: MemberRole | null | undefined, userId: string, task: { creatorId: string }): boolean {
  if (can(role, 'task.deleteAny')) return true;
  return !!role && task.creatorId === userId;
}
