// ═══════════════════════════════════════════════════════════
// BUTTON CONFIGURATION
// Types + CVA variants + Configs + Helpers
// ═══════════════════════════════════════════════════════════

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "gradient"
  | "icon";

export type ButtonSize =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "xl"
  | "icon-xs"
  | "icon-sm"
  | "icon"
  | "icon-lg"
  | "icon-xl";

export type ButtonTypography =
  "caption" | "body-sm" | "body" | "body-lg" | "label" | "heading";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ButtonShadow = "none" | "sm" | "md" | "lg" | "xl" | "glow";

export type ButtonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

export type ButtonAnimation = "none" | "pulse" | "bounce" | "spin" | "shake";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type ButtonCursor =
  | "pointer"
  | "default"
  | "none"
  | "wait"
  | "crosshair"
  | "not-allowed"
  | "help"
  | "text"
  | "move"
  | "grab"
  | "grabbing";

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: "submit" | "button" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  typography?: ButtonTypography;
  iconSize?: IconSize;
  shadow?: ButtonShadow;
  radius?: ButtonRadius;
  animation?: ButtonAnimation;
  cursor?: ButtonCursor;
  btnStyle?: string;
  tooltipStyle?: string;
  tooltipContent?: string;
  buttonContent?: ReactNode;
  icon?: ReactNode;
  lastIcon?: ReactNode;
  isPending?: boolean;
  handleOpen?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  side?: TooltipSide;
  loadingContent?: ReactNode;
  /** Stretch to the container's width. */
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────
// CVA VARIANT DEFINITIONS
// ─────────────────────────────────────────────────────────

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-br from-[#004706] via-[#009D36] to-[#004706] text-white hover:opacity-90 shadow-md",
        icon: "bg-transparent text-muted-foreground !p-0 ",
      },
      size: {
        xs: "h-6 rounded-md px-2 text-xs gap-1.5",
        sm: "h-8 rounded-md px-3 text-sm gap-1.5",
        default: "h-9 rounded-md px-4 text-sm gap-2",
        lg: "h-10 rounded-md px-6 text-base gap-2",
        xl: "h-12 rounded-lg px-8 text-lg gap-2.5",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-4",
        icon: "size-9 rounded-md [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 rounded-md [&_svg:not([class*='size-'])]:size-5",
        "icon-xl": "size-12 rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
        glow: "shadow-[0_0_20px_rgba(0,157,54,0.4)]",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        shake: "animate-shake",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// ─────────────────────────────────────────────────────────
// CURSOR CONFIG
// ─────────────────────────────────────────────────────────

export const cursorConfig: Record<ButtonCursor, string> = {
  pointer: "cursor-pointer",
  default: "cursor-default",
  none: "cursor-none",
  wait: "cursor-wait",
  crosshair: "cursor-crosshair",
  "not-allowed": "cursor-not-allowed",
  help: "cursor-help",
  text: "cursor-text",
  move: "cursor-move",
  grab: "cursor-grab",
  grabbing: "cursor-grabbing",
};

// ─────────────────────────────────────────────────────────
// TYPOGRAPHY CONFIG
// ─────────────────────────────────────────────────────────

export const typographyConfig: Record<ButtonTypography, string> = {
  caption: "text-xs leading-tight",
  "body-sm": "text-sm leading-normal",
  body: "text-base leading-normal",
  "body-lg": "text-lg leading-relaxed",
  label: "text-sm font-medium leading-normal",
  heading: "text-base font-semibold leading-tight",
};

// ─────────────────────────────────────────────────────────
// ICON SIZE CONFIG
// ─────────────────────────────────────────────────────────

export const iconSizeConfig: Record<IconSize, string> = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
};

// ─────────────────────────────────────────────────────────
// LABELS
// ─────────────────────────────────────────────────────────

export const variantLabels: Record<ButtonVariant, string> = {
  default: "Default",
  destructive: "Destructive",
  outline: "Outline",
  secondary: "Secondary",
  ghost: "Ghost",
  link: "Link",
  gradient: "Gradient",
  icon: "Icon",
};

export const sizeLabels: Record<ButtonSize, string> = {
  xs: "Extra Small",
  sm: "Small",
  default: "Default",
  lg: "Large",
  xl: "Extra Large",
  "icon-xs": "Icon XS",
  "icon-sm": "Icon Small",
  icon: "Icon Default",
  "icon-lg": "Icon Large",
  "icon-xl": "Icon XL",
};

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

export const getVariantOptions = () =>
  Object.entries(variantLabels).map(([value, label]) => ({
    value: value as ButtonVariant,
    label,
  }));

export const getSizeOptions = () =>
  Object.entries(sizeLabels).map(([value, label]) => ({
    value: value as ButtonSize,
    label,
  }));

export const getTypographyOptions = () =>
  Object.entries(typographyConfig).map(([value]) => ({
    value: value as ButtonTypography,
    label: value.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  }));

export const getIconSizeOptions = () =>
  Object.entries(iconSizeConfig).map(([value]) => ({
    value: value as IconSize,
    label: value.toUpperCase(),
  }));

// ── CVA Types ──
export type ButtonVariants = VariantProps<typeof buttonVariants>;
