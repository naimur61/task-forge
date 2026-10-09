'use client';

import { format } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardSummary } from '@/types/dashboard';
import { ChartCard } from './chart-card';
import { ChartTooltip } from './chart-tooltip';

/** "2026-10-09" → "Oct 9". */
const shortDay = (date: string) => format(new Date(`${date}T12:00:00`), 'MMM d');

/** Tasks completed per day over the last 14 days. */
export function CompletionTrend({ trend }: { trend: DashboardSummary['completionTrend'] }) {
  const total = trend.reduce((sum, day) => sum + day.completed, 0);

  return (
    <ChartCard title="Completed per day" description={`${total} tasks finished in the last 14 days`}>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeDasharray: '3 3' }}
              content={<ChartTooltip unit="completed" formatLabel={shortDay} />}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#trend-fill)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
