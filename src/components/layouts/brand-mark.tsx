import { Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Small square logo used in the sidebar, top bar and auth pages. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm',
        className,
      )}
    >
      <Hammer className="h-4 w-4" aria-hidden />
    </span>
  );
}
