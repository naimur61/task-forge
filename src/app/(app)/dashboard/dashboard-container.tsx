'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Skeleton } from 'boneyard-js/react';
import { FolderPlus } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state/empty-state';
import { ErrorState } from '@/components/common/error-state/error-state';
import { PageHeader } from '@/components/common/page-header/page-header';
import { ActivityFeed } from '@/components/features/activity/activity-feed';
import { ChartCard } from '@/components/features/dashboard/chart-card';
import { MyTasksList } from '@/components/features/dashboard/my-tasks-list';
import { StatCards } from '@/components/features/dashboard/stat-cards';
import { StatusBreakdown } from '@/components/features/dashboard/status-breakdown';
import { DASHBOARD_FIXTURE, MY_TASKS_FIXTURE } from '@/mocks/fixtures/dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardSummary, useMyTasks } from './service';

// Charts pull in Recharts (~100 kB), so they load after the rest of the page.
const PriorityChart = dynamic(() => import('@/components/features/dashboard/priority-chart').then((m) => m.PriorityChart), {
  ssr: false,
});
const CompletionTrend = dynamic(() => import('@/components/features/dashboard/completion-trend').then((m) => m.CompletionTrend), {
  ssr: false,
});

export default function DashboardContainer() {
  const router = useRouter();
  const { user } = useAuth();
  const summaryQuery = useDashboardSummary();
  const myTasksQuery = useMyTasks();
  const summary = summaryQuery.data?.data ?? DASHBOARD_FIXTURE;
  const isNewUser = summaryQuery.isSuccess && summary.projects.total === 0;

  const newProjectButton = (
    <ActionButton icon={<FolderPlus />} handleOpen={() => router.push('/projects?new=1')}>
      New project
    </ActionButton>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0] ?? ''}`}
        description="Here's what's happening across your projects."
        actions={newProjectButton}
      />

      {summaryQuery.isError && <ErrorState error={summaryQuery.error} onRetry={() => summaryQuery.refetch()} />}

      {isNewUser && (
        <EmptyState
          title="Create your first project"
          description="Projects hold your tasks and team. Start one and invite your teammates."
          action={newProjectButton}
        />
      )}

      {!summaryQuery.isError && !isNewUser && (
        <>
          <Skeleton name="dashboard-stats" loading={summaryQuery.isPending} fixture={<StatCards summary={DASHBOARD_FIXTURE} />}>
            <StatCards summary={summary} />
          </Skeleton>

          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton
              name="dashboard-status"
              className="h-full [&>div]:h-full"
              loading={summaryQuery.isPending}
              fixture={<StatusBreakdown byStatus={DASHBOARD_FIXTURE.byStatus} />}
            >
              <StatusBreakdown byStatus={summary.byStatus} />
            </Skeleton>
            <Skeleton
              name="dashboard-priority"
              className="h-full [&>div]:h-full"
              loading={summaryQuery.isPending}
              fixture={<PriorityChart byPriority={DASHBOARD_FIXTURE.byPriority} />}
            >
              <PriorityChart byPriority={summary.byPriority} />
            </Skeleton>
            <Skeleton
              name="dashboard-trend"
              className="h-full [&>div]:h-full"
              loading={summaryQuery.isPending}
              fixture={<CompletionTrend trend={DASHBOARD_FIXTURE.completionTrend} />}
            >
              <CompletionTrend trend={summary.completionTrend} />
            </Skeleton>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <ChartCard
              title="My tasks"
              description="Open tasks assigned to you, soonest due first"
              className="lg:col-span-3"
            >
              {myTasksQuery.isError ? (
                <ErrorState error={myTasksQuery.error} onRetry={() => myTasksQuery.refetch()} />
              ) : (
                <Skeleton name="dashboard-my-tasks" loading={myTasksQuery.isPending} fixture={<MyTasksList tasks={MY_TASKS_FIXTURE} />}>
                  <MyTasksList tasks={myTasksQuery.data?.data ?? []} total={myTasksQuery.data?.meta.total} />
                </Skeleton>
              )}
            </ChartCard>

            <ChartCard title="Recent activity" description="Latest changes in your projects" className="lg:col-span-2">
              <Skeleton
                name="dashboard-activity"
                loading={summaryQuery.isPending}
                fixture={<ActivityFeed items={DASHBOARD_FIXTURE.recentActivity} showProject />}
              >
                <ActivityFeed items={summary.recentActivity} showProject />
              </Skeleton>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
