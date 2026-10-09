import { db } from './db';
import type { RealtimeEvent, RealtimePayload } from '@/types/realtime';

/** Where the demo socket server accepts events (server-side only). */
const EMIT_URL = process.env.SOCKET_EMIT_URL ?? 'http://localhost:4001/emit';
const EMIT_SECRET = process.env.SOCKET_EMIT_SECRET ?? 'dev-secret';

/**
 * Event name for each changing API route. Routes that are missing here don't broadcast.
 * Keys are `METHOD /path/with/:params`, exactly as in src/mocks/routes.
 */
const EVENTS: Record<string, RealtimeEvent> = {
  'POST /projects': 'project.created',
  'PATCH /projects/:projectId': 'project.updated',
  'POST /projects/:projectId/archive': 'project.updated',
  'POST /projects/:projectId/restore': 'project.updated',
  'DELETE /projects/:projectId': 'project.deleted',
  'POST /projects/:projectId/members': 'member.added',
  'PATCH /projects/:projectId/members/:userId': 'member.updated',
  'DELETE /projects/:projectId/members/:userId': 'member.removed',
  'POST /projects/:projectId/transfer-ownership': 'member.updated',
  'POST /projects/:projectId/tasks': 'task.created',
  'PATCH /projects/:projectId/tasks/:taskId': 'task.updated',
  'PATCH /projects/:projectId/tasks/:taskId/move': 'task.moved',
  'DELETE /projects/:projectId/tasks/:taskId': 'task.deleted',
  'POST /projects/:projectId/tasks/:taskId/comments': 'comment.added',
  'PATCH /projects/:projectId/tasks/:taskId/comments/:commentId': 'comment.updated',
  'DELETE /projects/:projectId/tasks/:taskId/comments/:commentId': 'comment.deleted',
  'POST /projects/:projectId/labels': 'label.created',
};

/** Send one event to a room on the socket server. Fire-and-forget: the app works without it. */
export function broadcast(room: string, event: RealtimeEvent, payload: RealtimePayload): void {
  if (process.env.NODE_ENV === 'test') return;
  fetch(EMIT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-emit-secret': EMIT_SECRET },
    body: JSON.stringify({ room, event, payload }),
  }).catch(() => {
    // Socket server not running: real-time is simply off.
  });
}

/** After a successful change, tell everyone in the project (and the affected user). */
export function broadcastChange(
  routeKey: string,
  params: Record<string, string>,
  body: Record<string, any>,
  actorId: string,
  responseData: { id?: string } | undefined,
): void {
  const event = EVENTS[routeKey];
  if (!event) return;

  const actorName = db.users.find((u) => u.id === actorId)?.name ?? 'Someone';
  const projectId = params.projectId ?? (event === 'project.created' ? responseData?.id : undefined);
  const userId = params.userId ?? body.userId;
  const payload: RealtimePayload = { projectId, taskId: params.taskId, userId, actorId, actorName };

  if (event === 'project.created') {
    broadcast(`user:${actorId}`, event, payload);
    return;
  }
  broadcast(`project:${projectId}`, event, payload);

  // The added user isn't in the project room yet, so tell them directly too.
  if (event === 'member.added') {
    const project = db.projects.find((p) => p.id === projectId);
    broadcast(`user:${userId}`, 'notification.created', {
      ...payload,
      message: `${actorName} added you to ${project?.name ?? 'a project'}`,
    });
  }
}

/** Tell one user they have a new notification. */
export function notifyUser(userId: string, actorId: string, message: string, projectId?: string): void {
  const actorName = db.users.find((u) => u.id === actorId)?.name ?? 'Someone';
  broadcast(`user:${userId}`, 'notification.created', { userId, actorId, actorName, message, projectId });
}
