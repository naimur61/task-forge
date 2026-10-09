'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRealtime } from '@/providers/realtime-provider';
import type { RealtimeEvent, RealtimePayload } from '@/types/realtime';
import { projectKeys } from './projects/service';
import { labelKeys, memberKeys, taskKeys } from './projects/[projectId]/service';
import { activityKeys } from './projects/[projectId]/activity/service';
import { notificationKeys } from './service';

/** Which cached data each event makes stale. */
function staleKeys(event: RealtimeEvent, projectId: string): QueryKey[] {
  const projectWide: QueryKey[] = [projectKeys.all, ['dashboard'], activityKeys.all(projectId)];
  if (event.startsWith('task.') || event.startsWith('comment.')) return [...projectWide, taskKeys.all(projectId)];
  if (event.startsWith('member.')) return [...projectWide, memberKeys.list(projectId), taskKeys.all(projectId)];
  if (event === 'label.created') return [labelKeys.list(projectId)];
  return [...projectWide, taskKeys.all(projectId)];
}

const PROJECT_EVENTS: RealtimeEvent[] = [
  'project.created',
  'project.updated',
  'project.deleted',
  'member.added',
  'member.updated',
  'member.removed',
  'task.created',
  'task.updated',
  'task.moved',
  'task.deleted',
  'comment.added',
  'comment.updated',
  'comment.deleted',
  'label.created',
];

/** Keeps every open screen in sync with changes made by other people. Renders nothing. */
export default function RealtimeContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { on } = useRealtime();
  const myId = user?.id;

  useEffect(() => {
    /** Is this project open on screen right now? */
    const isViewing = (projectId?: string) => !!projectId && pathname.startsWith(`/projects/${projectId}`);

    const handleProjectEvent = (event: RealtimeEvent) => (payload: RealtimePayload) => {
      if (!payload.projectId) return;
      staleKeys(event, payload.projectId).forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

      // Kick people out of a project they can no longer see.
      const removedMe = event === 'member.removed' && payload.userId === myId && payload.actorId !== myId;
      const deletedByOther = event === 'project.deleted' && payload.actorId !== myId;
      if ((removedMe || deletedByOther) && isViewing(payload.projectId)) {
        toast.error(removedMe ? `${payload.actorName} removed you from this project` : `${payload.actorName} deleted this project`);
        router.replace('/projects');
      }
    };

    const unsubscribers = PROJECT_EVENTS.map((event) => on(event, handleProjectEvent(event)));

    // New notification for me: refresh the bell and show it.
    unsubscribers.push(
      on('notification.created', (payload) => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        if (payload.message) toast(payload.message, { icon: '🔔' });
      }),
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [on, queryClient, router, pathname, myId]);

  return null;
}
