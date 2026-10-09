import { useFetchData } from '@/hooks/api-hooks';
import type { Activity } from '@/types/activity';
import type { Paginated } from '@/types/common';

/** One page of the project's activity timeline, newest first. */
export const useProjectActivity = (projectId: string, page: number) =>
  useFetchData<Paginated<Activity>>({
    path: `projects/${projectId}/activity`,
    queryKey: ['activity', projectId, { page }],
    filterData: { page, limit: 20 },
    keepPreviousData: true,
  });
