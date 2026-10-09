interface ErrorAlertProps {
  error: string | null;
}

/** Inline form error banner, announced to screen readers. Renders nothing without an error. */
export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;
  return (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </div>
  );
}
