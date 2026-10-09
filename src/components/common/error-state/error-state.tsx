'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { getErrorMessage } from '@/lib/http/api-error';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  /** The error from a query. Its message is shown to the user. */
  error?: unknown;
  title?: string;
  /** Shows a "Try again" button. */
  onRetry?: () => void;
  className?: string;
}

/** Box shown when data failed to load, with an optional retry button. */
export function ErrorState({ error, title = 'Could not load this', onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <ActionButton variant="outline" size="sm" icon={<RotateCw />} handleOpen={onRetry}>
          Try again
        </ActionButton>
      )}
    </div>
  );
}
