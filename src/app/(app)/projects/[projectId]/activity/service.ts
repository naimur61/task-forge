import { useFetchData } from '@/hooks/api-hooks';
import type { Activity } from '@/types/activity';
import type { Paginated } from '@/types/common';

export const activityKeys = {
  all: (projectId: string) => ['activity', projectId] as const,
};

/** One page of the project's activity timeline, newest first. */
export const useProjectActivity = (projectId: string, page: number) =>
  useFetchData<Paginated<Activity>>({
    path: `projects/${projectId}/activity`,
    queryKey: [...activityKeys.all(projectId), { page }],
    filterData: { page, limit: 20 },
    keepPreviousData: true,
  });
