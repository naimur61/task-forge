'use client';

import { useState } from 'react';
import { statusInfo } from '@/config/task';
import { cn } from '@/lib/utils';
import type { DashboardSummary } from '@/types/dashboard';
import type { TaskStatus } from '@/types/task';
import { ChartCard } from './chart-card';

/** Tasks by status: one stacked bar plus a legend with counts and percentages. */
export function StatusBreakdown({ byStatus }: { byStatus: DashboardSummary['byStatus'] }) {
  const [hovered, setHovered] = useState<TaskStatus | null>(null);
  const total = byStatus.reduce((sum, item) => sum + item.count, 0);
  const percent = (count: number) => (total ? Math.round((count / total) * 100) : 0);
  const active = byStatus.find((item) => item.status === hovered);

  return (
    <ChartCard title="Tasks by status" description={`${total} tasks across your projects`}>
      {/* Hover readout: shows the hovered segment, otherwise the total. */}
      <p className="mb-2 h-5 text-sm text-muted-foreground" aria-live="polite">
        {active ? (
          <>
            <span className="font-medium text-foreground">{statusInfo(active.status).label}</span> · {active.count} tasks (
            {percent(active.count)}%)
          </>
        ) : (
          'Hover a segment for details'
        )}
      </p>

      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded" role="img" aria-label="Tasks by status">
        {byStatus
          .filter((item) => item.count > 0)
          .map((item) => (
            <div
              key={item.status}
              className={cn('h-full transition-opacity first:rounded-l last:rounded-r', hovered && hovered !== item.status && 'opacity-40')}
              style={{ width: `${(item.count / total) * 100}%`, backgroundColor: statusInfo(item.status).color }}
              onMouseEnter={() => setHovered(item.status)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {byStatus.map((item) => (
          <li
            key={item.status}
            className="flex items-center justify-between gap-2 text-sm"
            onMouseEnter={() => setHovered(item.status)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: statusInfo(item.status).color }} aria-hidden />
              {statusInfo(item.status).label}
            </span>
            <span className="tabular-nums text-foreground">
              {item.count} <span className="text-muted-foreground">({percent(item.count)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
