'use client';

interface ChartTooltipProps {
  /** Filled in by Recharts. */
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  /** Word after the number, e.g. "tasks". */
  unit: string;
  /** Turn the raw x value into display text. */
  formatLabel?: (label: string) => string;
}

/** Small tooltip card used by every dashboard chart. */
export function ChartTooltip({ active, payload, label, unit, formatLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">{formatLabel && label ? formatLabel(label) : label}</p>
      <p className="mt-0.5 font-semibold text-foreground">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}
