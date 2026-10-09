/** A notification for the current user. */
export interface Notification {
  id: string;
  /** e.g. `task.assigned`, `comment.added`, `member.added`. */
  type: string;
  message: string;
  /** Where clicking the notification goes. */
  link: string | null;
  readAt: string | null;
  createdAt: string;
}
