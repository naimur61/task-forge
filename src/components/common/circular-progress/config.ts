// ─── Types ──────────────────────────────────────────────────────────────────

export type ProgressVariant =
  "primary" | "success" | "warning" | "danger" | "info";

export type ProgressSize = "xs" | "sm" | "md" | "lg" | "xl";

// ─── Color palette ──────────────────────────────────────────────────────────

export const progressColorMap: Record<ProgressVariant, string> = {
  primary: "#3b82f6", // blue-500
  success: "#10b981", // emerald-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  info: "#06b6d4", // cyan-500
};

export const getProgressColor = (color: ProgressVariant | string): string =>
  progressColorMap[color as ProgressVariant] ?? color;

// ─── Size presets ───────────────────────────────────────────────────────────

export interface ProgressSizePreset {
  /** Outer box width/height in tailwind units */
  box: string;
  /** svg width/height in tailwind units */
  svg: string;
  /** Circle radius in svg units */
  radius: number;
  /** Stroke width in svg units */
  strokeWidth: number;
  /** Center label text size */
  label: string;
  /** Default label format */
  defaultLabelSize: string;
}

export const progressSizes: Record<ProgressSize, ProgressSizePreset> = {
  xs: {
    box: "w-10 h-10",
    svg: "w-10 h-10",
    radius: 14,
    strokeWidth: 3,
    label: "text-[9px]",
    defaultLabelSize: "text-[9px]",
  },
  sm: {
    box: "w-12 h-12",
    svg: "w-12 h-12",
    radius: 15,
    strokeWidth: 4,
    label: "text-[10px]",
    defaultLabelSize: "text-[10px]",
  },
  md: {
    box: "w-14 h-14",
    svg: "w-14 h-14",
    radius: 16,
    strokeWidth: 4,
    label: "text-[11px]",
    defaultLabelSize: "text-[11px]",
  },
  lg: {
    box: "w-20 h-20",
    svg: "w-20 h-20",
    radius: 18,
    strokeWidth: 5,
    label: "text-sm",
    defaultLabelSize: "text-sm",
  },
  xl: {
    box: "w-28 h-28",
    svg: "w-28 h-28",
    radius: 20,
    strokeWidth: 6,
    label: "text-lg",
    defaultLabelSize: "text-lg",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const clampPercent = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};
