import { cn } from '@/lib/utils';

/** Small "Live" / "Offline" pill showing whether real-time updates are flowing. */
export function LiveStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground md:inline-flex"
      title={isConnected ? 'Changes from your team appear instantly' : 'Live updates are off. Refresh to see changes.'}
      aria-live="polite"
    >
      <span className={cn('h-2 w-2 rounded-full', isConnected ? 'animate-pulse bg-emerald-500' : 'bg-muted-foreground/40')} aria-hidden />
      {isConnected ? 'Live' : 'Offline'}
    </span>
  );
}
