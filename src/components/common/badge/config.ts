// ─── Size Types ─────────────────────────────────────────────────────────────

/** Available sizes for dot and badge */
export type Size = "xs" | "sm" | "md" | "lg";

// ─── Component Props ────────────────────────────────────────────────────────

/** Props for the StatusDot component */
export interface StatusDotProps {
  status: string;
  color?: string;
  size?: Size;
  className?: string;
}

/** Props for the StatusBadge component */
export interface StatusBadgeProps {
  status: string;
  color?: string;
  bgColor?: string;
  label?: string;
  lastLabel?: string;
  showBg?: boolean;
  uppercase?: boolean;
  className?: string;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
}

// ─── Color Palette ──────────────────────────────────────────────────────────

export const COLORS = {
  green: "#22C55E",
  teal: "#10B981",
  mint: "#81f9ad",
  amber: "#EAB308",
  red: "#EF4444",
  darkRed: "#DC2626",
  blue: "#3B82F6",
  gray: "#6B7280",
  lightGray: "#D0D5DD",
} as const;

// ─── Status Color Map ───────────────────────────────────────────────────────

export const statusColorMap = {
  // Success
  paid: COLORS.green,
  published: COLORS.green,
  active: COLORS.green,
  pass: COLORS.green,
  passed: COLORS.green,
  success: COLORS.teal,
  complete: COLORS.teal,
  temporarily_active: COLORS.mint,

  // Pending
  pending: COLORS.amber,
  upcoming: COLORS.amber,
  unpublished: COLORS.amber,

  // Error
  incomplete: COLORS.red,
  fail: COLORS.darkRed,
  failed: COLORS.darkRed,
  expired: COLORS.darkRed,
  rejected: COLORS.darkRed,
  inactive: COLORS.darkRed,
  deactivate: COLORS.darkRed,
  suspended: COLORS.darkRed,
  closed: COLORS.darkRed,

  // Info
  completed: COLORS.blue,
  booked: COLORS.blue,

  // Neutral
  canceled: COLORS.gray,
  default: COLORS.lightGray,
} as const;

export type StatusKey = keyof typeof statusColorMap;

// ─── Dot Size Config ────────────────────────────────────────────────────────

export const dotSizes: Record<
  Size,
  { size: number; strokeWidth: number; className: string }
> = {
  xs: { size: 10, strokeWidth: 5, className: "-ml-1 w-2.5 h-2.5" },
  sm: { size: 14, strokeWidth: 6, className: "-ml-1.5 w-3 h-3" },
  md: { size: 20, strokeWidth: 8, className: "-ml-2 w-4 h-4" },
  lg: { size: 28, strokeWidth: 10, className: "-ml-2.5 w-5 h-5" },
};

// ─── Badge Size Config ──────────────────────────────────────────────────────

export const badgeSizes: Record<
  Size,
  { container: string; text: string; label: string; dotSize: Size }
> = {
  xs: {
    container: "px-1.5 py-0.5 rounded-md gap-0.5",
    text: "text-[9px]",
    label: "text-[9px]",
    dotSize: "xs",
  },
  sm: {
    container: "px-2 py-0.5 rounded-lg gap-0.5",
    text: "text-[10px]",
    label: "text-[10px]",
    dotSize: "sm",
  },
  md: {
    container: "px-3 py-1 rounded-xl gap-1",
    text: "text-xs",
    label: "text-xs",
    dotSize: "md",
  },
  lg: {
    container: "px-4 py-1.5 rounded-2xl gap-1.5",
    text: "text-sm",
    label: "text-sm",
    dotSize: "lg",
  },
};

// ─── Utility Functions ──────────────────────────────────────────────────────

/** Get color for a status, falls back to default gray */
export function getStatusColor(status: string): string {
  const key = status?.toLowerCase() as StatusKey;
  return statusColorMap[key] ?? statusColorMap.default;
}

/** Convert hex to rgba with opacity */
export function getLightBg(color: string, opacity = 0.1): string {
  if (!color.startsWith("#") || color.length !== 7) return color;

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
