import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import {
  getStatusColor,
  getLightBg,
  dotSizes,
  badgeSizes,
  type StatusDotProps,
  type StatusBadgeProps,
  type Size,
} from "./config";

// ─── Helpers ────────────────────────────────────────────────────────────────

const shouldApplyInlineColor = (className?: string): boolean =>
  !className || !/text-/.test(className);

const resolveSize = (xs?: boolean, sm?: boolean, lg?: boolean): Size =>
  xs ? "xs" : sm ? "sm" : lg ? "lg" : "md";

// ─── Components ─────────────────────────────────────────────────────────────

export function StatusDot({
  status,
  color: customColor,
  size = "md",
  className,
}: StatusDotProps) {
  const color = customColor || getStatusColor(status);
  const { size: dotSize, strokeWidth, className: sizeClass } = dotSizes[size];

  return (
    <Dot
      size={dotSize}
      strokeWidth={strokeWidth}
      className={cn(sizeClass, className)}
      style={shouldApplyInlineColor(className) ? { color } : undefined}
    />
  );
}

export function StatusBadge({
  status,
  color: customColor,
  bgColor: customBgColor,
  label,
  lastLabel,
  showBg = false,
  uppercase = true,
  className,
  xs,
  sm,
  lg,
}: StatusBadgeProps) {
  const size = resolveSize(xs, sm, lg);
  const color = customColor || getStatusColor(status);
  const bgColor =
    customBgColor || (showBg ? getLightBg(color, 0.15) : "transparent");
  const { container, text, label: labelClass, dotSize } = badgeSizes[size];
  const useInlineColor = shouldApplyInlineColor(className);

  return (
    <div
      className={cn(
        "flex items-center border capitalize w-fit",
        container,
        className,
      )}
      style={{ borderColor: color, backgroundColor: bgColor }}
    >
      <StatusDot status={status} color={color} size={dotSize} />

      {label && (
        <span className={cn("font-semibold text-foreground", labelClass)}>
          {label}:
        </span>
      )}

      <span
        className={cn(uppercase && "uppercase", "font-semibold", text)}
        style={useInlineColor ? { color } : undefined}
      >
        {status}
      </span>

      {lastLabel && (
        <span className={cn("font-semibold text-foreground", labelClass)}>
          {lastLabel}
        </span>
      )}
    </div>
  );
}

// ─── Re-exports ─────────────────────────────────────────────────────────────

export type {
  StatusDotProps,
  StatusBadgeProps,
  Size,
  StatusKey,
} from "./config";
export { COLORS, statusColorMap, getStatusColor, getLightBg } from "./config";
