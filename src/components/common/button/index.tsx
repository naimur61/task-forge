// ═══════════════════════════════════════════════════════════
// ACTION BUTTON COMPONENT
// Dynamic, customizable button with all variants
// ═══════════════════════════════════════════════════════════

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import {
  type ActionButtonProps,
  buttonVariants,
  typographyConfig,
  iconSizeConfig,
  cursorConfig,
} from "./config";
import { Button } from "@/components/ui/custom/button";

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      type = "button",
      variant = "default",
      size = "default",
      typography,
      iconSize = "md",
      shadow,
      radius,
      animation,
      cursor,
      btnStyle,
      tooltipStyle,
      tooltipContent,
      buttonContent,
      icon,
      lastIcon,
      isPending = false,
      handleOpen,
      side = "top",
      loadingContent,
      disabled = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    // ── Resolve dynamic classes ──
    const typographyClass = typography ? typographyConfig[typography] : "";
    const iconSizeClass = icon ? iconSizeConfig[iconSize] : "";

    // ── Build button element ──
    const buttonEl = (
      <Button
        ref={ref}
        type={type}
        onClick={handleOpen}
        variant={variant === "gradient" ? "default" : variant}
        size={size}
        disabled={isPending || disabled}
        className={cn(
          // CVA variants
          buttonVariants({ variant, size, shadow, radius, animation }),
          // Typography override
          typographyClass,
          // State styles
          (isPending || disabled) && "opacity-60",
          // Cursor override
          cursor && cursorConfig[cursor],
          fullWidth && "w-full",
          // Custom styles
          btnStyle,
          // Additional classes
          className,
        )}
        {...props}
      >
        {/* Loading or Icon */}
        {isPending ? (
          <Loader2 className="animate-spin size-4" />
        ) : icon ? (
          <span className={cn("shrink-0", iconSizeClass)}>{icon}</span>
        ) : null}

        {/* Button Content */}
        {(buttonContent || children) && (
          <span className="flex-1">
            {isPending
              ? (loadingContent ?? buttonContent ?? children)
              : (buttonContent ?? children)}
          </span>
        )}

        {/* Last Icon */}
        {!isPending && lastIcon && (
          <span className={cn("shrink-0", iconSizeClass)}>{lastIcon}</span>
        )}
      </Button>
    );

    // ── Wrap with tooltip if provided ──
    if (!tooltipContent) return buttonEl;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            "bg-muted-foreground text-primary-foreground",
            tooltipStyle,
          )}
        >
          <p className="text-[10px]">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);

ActionButton.displayName = "ActionButton";

// ── Named Exports ──
export { ActionButton };

// ── Re-export all types and configs ──
export type {
  ActionButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonTypography,
  IconSize,
  ButtonShadow,
  ButtonRadius,
  ButtonAnimation,
  TooltipSide,
  ButtonVariants,
} from "./config";

export {
  buttonVariants,
  typographyConfig,
  iconSizeConfig,
  variantLabels,
  sizeLabels,
  getVariantOptions,
  getSizeOptions,
  getTypographyOptions,
  getIconSizeOptions,
} from "./config";
