import type { Member } from '@/types/member';
import { FIXTURE_USER } from './tasks';

/** Sample members. Only used by boneyard to capture skeleton shapes. */
export const MEMBERS_FIXTURE: Member[] = (['OWNER', 'ADMIN', 'MEMBER', 'MEMBER'] as const).map((role, i) => ({
  id: `mbr_fixture_${i}`,
  projectId: 'prj_fixture',
  role,
  joinedAt: '2026-09-01T09:00:00.000Z',
  user: { ...FIXTURE_USER, id: `usr_fixture_${i}` },
}));
