'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { priorityInfo } from '@/config/task';
import type { DashboardSummary } from '@/types/dashboard';
import { ChartCard } from './chart-card';
import { ChartTooltip } from './chart-tooltip';

/** Tasks by priority as a single-color bar chart (lowest to highest). */
export function PriorityChart({ byPriority }: { byPriority: DashboardSummary['byPriority'] }) {
  const data = byPriority.map((item) => ({ name: priorityInfo(item.priority).label, count: item.count }));

  return (
    <ChartCard title="Tasks by priority" description="All tasks, any status">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltip unit="tasks" />} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
