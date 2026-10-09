import type { UserSummary } from '@/types/common';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

/** Sample user for skeleton fixtures. */
export const FIXTURE_USER: UserSummary = { id: 'usr_fixture', name: 'Ava Chen', email: 'ava@demo.dev', avatarUrl: null };

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/** A sample task with realistic text lengths. Only used by boneyard to capture skeleton shapes. */
export function fixtureTask(i: number, status: TaskStatus = STATUSES[i % 4]): Task {
  return {
    id: `tsk_fixture_${i}`,
    projectId: 'prj_fixture',
    title: ['Design new homepage hero', 'Fix navbar overlap on Safari', 'Write accessibility audit', 'Set up image CDN'][i % 4],
    description: 'Keep it simple and follow the design system tokens.',
    status,
    priority: PRIORITIES[i % 4],
    position: i * 1000,
    dueDate: '2026-10-20T08:00:00.000Z',
    assignee: FIXTURE_USER,
    creator: FIXTURE_USER,
    labels: [{ id: 'lbl_fixture', projectId: 'prj_fixture', name: 'Feature', color: '#6366f1' }],
    commentCount: 2,
    completedAt: null,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
  };
}

/** A list of sample tasks. */
export const TASKS_FIXTURE: Task[] = Array.from({ length: 8 }, (_, i) => fixtureTask(i));
