/** Every event the real-time server can send. */
export type RealtimeEvent =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'member.added'
  | 'member.updated'
  | 'member.removed'
  | 'task.created'
  | 'task.updated'
  | 'task.moved'
  | 'task.deleted'
  | 'comment.added'
  | 'comment.updated'
  | 'comment.deleted'
  | 'label.created'
  | 'notification.created';

/** What every real-time event carries. */
export interface RealtimePayload {
  projectId?: string;
  taskId?: string;
  /** The user the change is about (added/removed member, assignee). */
  userId?: string;
  actorId: string;
  actorName: string;
  /** Short readable text for toasts. */
  message?: string;
}
