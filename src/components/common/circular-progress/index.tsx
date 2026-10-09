"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  clampPercent,
  getProgressColor,
  progressSizes,
  type ProgressSize,
  type ProgressVariant,
} from "./config";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CircularProgressProps {
  /** Percentage value, 0–100. Values outside the range are clamped. */
  value: number;

  /** Semantic variant or a raw hex/css color string. */
  color?: ProgressVariant | string;

  /** Background ring color (the unfilled track). */
  trackColor?: string;

  /** Size preset. */
  size?: ProgressSize;

  /** Override stroke width in svg units. */
  strokeWidth?: number;

  /** Show the percent label in the center. */
  showLabel?: boolean;

  /** Render a custom node instead of the default "%" label. */
  label?: React.ReactNode;

  /** Use a round line cap for a softer look. */
  rounded?: boolean;

  /** Animate the value when it changes. */
  animated?: boolean;

  /** Additional classes for the outer wrapper. */
  className?: string;

  /** Additional classes for the center label. */
  labelClassName?: string;

  /**
   * Number of equal segments around the ring.
   * `0` (default) = smooth continuous arc.
   * `> 0` = segmented style (e.g. `4` for the classic 4-pie look).
   */
  segments?: number;

  /**
   * Gap between segments, in svg viewBox units.
   * Default = `2 * strokeWidth` so round caps don't touch.
   */
  segmentGap?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CircularProgress({
  value,
  color = "success",
  trackColor = "#f1f5f9",
  size = "md",
  strokeWidth,
  showLabel = true,
  label,
  rounded = true,
  animated = true,
  className,
  labelClassName,
  segments = 0,
  segmentGap,
}: CircularProgressProps) {
  const preset = progressSizes[size];
  const finalStroke = strokeWidth ?? preset.strokeWidth;
  const radius = preset.radius;
  const circumference = 2 * Math.PI * radius;
  const linecap = rounded ? "round" : "butt";

  const pct = clampPercent(value);
  const stroke = getProgressColor(color);

  // ── Animated display value (for the center label) ──────────────────────
  // `animValue` is only meaningful while `animated` is true; when not
  // animating we just read the prop directly so we never need a
  // synchronous setState in an effect (which would cascade re-renders).
  const [animValue, setAnimValue] = React.useState<number | null>(null);
  const displayValue = animated ? (animValue ?? pct) : pct;

  React.useEffect(() => {
    if (!animated) return;
    const from = animValue ?? pct;
    const to = pct;
    if (from === to) return;
    const duration = 600;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimValue(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // `animValue` is intentionally omitted so the rAF doesn't restart on
    // every interpolated frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, animated]);

  // ── Segmented math (computed once per render) ──────────────────────────
  const segmented = segments > 0;
  const slot = segmented ? circumference / segments : 0;
  const gap = segmented ? (segmentGap ?? Math.max(finalStroke * 2, 2)) : 0;
  const segLen = segmented ? Math.max(0, slot - gap) : 0;
  const perSeg = segmented ? 100 / segments : 0;
  const fullCount = segmented ? Math.floor(pct / perSeg) : 0;
  const remainder = segmented ? (pct - fullCount * perSeg) / perSeg : 0;
  const partialLen = segLen * remainder;

  const dashTransition = animated
    ? {
        transition: "stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }
    : undefined;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        preset.box,
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        viewBox="0 0 40 40"
        className={cn(preset.svg, "-rotate-90")}
        aria-hidden="true"
      >
        {/* Track (full background ring) */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke={trackColor}
          strokeWidth={finalStroke}
          fill="none"
        />

        {segmented ? (
          // ── Segmented mode: N discrete arcs around the ring ───────────
          <g>
            {Array.from({ length: segments }).map((_, i) => {
              let length: number;
              if (i < fullCount) length = segLen;
              else if (i === fullCount && remainder > 0) length = partialLen;
              else return null;

              return (
                <circle
                  key={i}
                  cx="20"
                  cy="20"
                  r={radius}
                  stroke={stroke}
                  strokeWidth={finalStroke}
                  fill="none"
                  strokeLinecap={linecap}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-i * slot}
                  style={dashTransition}
                />
              );
            })}
          </g>
        ) : (
          // ── Smooth arc mode ───────────────────────────────────────────
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={stroke}
            strokeWidth={finalStroke}
            fill="none"
            strokeLinecap={linecap}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            style={
              animated
                ? {
                    transition:
                      "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  }
                : undefined
            }
          />
        )}
      </svg>

      {showLabel && (
        <span
          className={cn(
            "absolute font-semibold text-center leading-none",
            preset.label,
            labelClassName,
          )}
        >
          {label ?? `${Math.round(displayValue)}%`}
        </span>
      )}
    </div>
  );
}

// ─── Re-exports ─────────────────────────────────────────────────────────────

export {
  progressColorMap,
  getProgressColor,
  progressSizes,
  clampPercent,
} from "./config";
export type { ProgressSize, ProgressVariant } from "./config";
