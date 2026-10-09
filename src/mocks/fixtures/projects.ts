import type { Project } from '@/types/project';
import { FIXTURE_USER } from './tasks';

/** Sample projects. Only used by boneyard to capture skeleton shapes. */
export const PROJECTS_FIXTURE: Project[] = Array.from({ length: 6 }, (_, i) => ({
  id: `prj_fixture_${i}`,
  name: ['Website Redesign', 'Mobile App v2', 'Public API'][i % 3],
  description: 'New marketing site with a faster, accessible design.',
  status: 'ACTIVE',
  ownerId: FIXTURE_USER.id,
  myRole: 'OWNER',
  memberCount: 5,
  membersPreview: [FIXTURE_USER, FIXTURE_USER, FIXTURE_USER, FIXTURE_USER],
  taskCount: 16,
  doneCount: 6,
  overdueCount: 2,
  createdAt: '2026-09-01T09:00:00.000Z',
  updatedAt: '2026-10-08T09:00:00.000Z',
}));
