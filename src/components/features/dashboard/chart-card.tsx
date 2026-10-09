import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  /** Buttons or links on the right of the title. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card frame for a dashboard chart or list. */
export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <section className={cn('h-full rounded-xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
