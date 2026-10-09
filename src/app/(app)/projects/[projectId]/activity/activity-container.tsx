'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { ErrorState } from '@/components/common/error-state/error-state';
import { Pagination } from '@/components/common/pagination/pagination';
import { ActivityFeed } from '@/components/features/activity/activity-feed';
import { useUrlState } from '@/hooks/ui/use-url-state';
import { DASHBOARD_FIXTURE } from '@/mocks/fixtures/dashboard';
import { useProjectActivity } from './service';

export default function ActivityContainer() {
  const { projectId } = useParams<{ projectId: string }>();
  const url = useUrlState();
  const page = Number(url.get('page') ?? 1);
  const activityQuery = useProjectActivity(projectId, page);

  if (activityQuery.isError) return <ErrorState error={activityQuery.error} onRetry={() => activityQuery.refetch()} />;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <Skeleton
          name="project-activity"
          loading={activityQuery.isPending}
          fixture={<ActivityFeed items={DASHBOARD_FIXTURE.recentActivity} />}
        >
          <ActivityFeed items={activityQuery.data?.data ?? []} />
        </Skeleton>
      </section>
      {activityQuery.data && (
        <Pagination
          currentPage={activityQuery.data.meta.page}
          totalPages={activityQuery.data.meta.totalPages}
          setCurrentPage={(next) => url.set({ page: next === 1 ? undefined : next })}
        />
      )}
    </div>
  );
}
