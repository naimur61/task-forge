import type { Notification } from '@/types/notification';

/** Sample notifications. Only used by boneyard to capture skeleton shapes. */
export const NOTIFICATIONS_FIXTURE: Notification[] = Array.from({ length: 6 }, (_, i) => ({
  id: `ntf_fixture_${i}`,
  type: ['task.assigned', 'comment.added', 'member.added'][i % 3],
  message: 'Marcus Reed assigned you "Pricing page copy review"',
  link: null,
  readAt: i > 1 ? '2026-10-01T09:00:00.000Z' : null,
  createdAt: '2026-10-09T09:00:00.000Z',
}));
