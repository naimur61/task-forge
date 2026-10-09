/* ──────────────────────────────────────────────────────────────
   Typography — dynamic component + named tags
   ────────────────────────────────────────────────────────────── */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TypographyVariant, TypographyProps } from "./types";

/* ════════════════════════════════════════════════════════════════
   DEFAULT TAG MAP — variant → HTML element
   ════════════════════════════════════════════════════════════════ */

const defaultTag: Record<TypographyVariant, React.ElementType> = {
  "title-1": "h1",
  "title-2": "h2",
  "title-3": "h3",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "body-1": "p",
  "body-2": "p",
  "body-3": "p",
  "body-4": "p",
  "label-1": "label",
  "label-2": "label",
  "label-3": "label",
  "caption-1": "span",
  "caption-2": "span",
};

/* ════════════════════════════════════════════════════════════════
   COLOR MAP — simple mapping from color name to Tailwind class
   ════════════════════════════════════════════════════════════════ */

const colorClassMap: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accentPrimary: "text-accent",
  errorPrimary: "text-destructive",
  successPrimary: "text-success",
  warningPrimary: "text-warning",
  infoPrimary: "text-info",
  muted: "text-muted-foreground",
  accentSecondary: "text-accent/80",
  errorSecondary: "text-destructive/80",
  successSecondary: "text-success/80",
  warningSecondary: "text-warning/80",
  infoSecondary: "text-info/80",
};

const weightClassMap: Record<string, string> = {
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

/* ════════════════════════════════════════════════════════════════
   DYNAMIC COMPONENT
   Usage: <Typography variant="h2" color="primary">text</Typography>
   ════════════════════════════════════════════════════════════════ */

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant,
      as,
      color,
      weight,
      limit,
      seeMore = false,
      seeMoreText = "See more",
      seeLessText = "See less",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Tag = as ?? defaultTag[variant];
    const colorClass = color ? colorClassMap[color] : undefined;
    const weightClass = weight ? weightClassMap[weight] : undefined;

    const isText = typeof children === "string" || typeof children === "number";
    const text = isText ? String(children) : "";
    const isResponsive = limit === true;
    const canCharTruncate =
      typeof limit === "number" && limit > 0 && isText && text.length > limit;
    const truncateClass = isResponsive ? "truncate" : "";

    const [expanded, setExpanded] = React.useState(false);

    const visibleContent =
      canCharTruncate && !expanded
        ? `${text.slice(0, limit as number).trimEnd()}…`
        : children;

    // Inline "See more / See less" toggle — completes the seeMore feature
    const canToggle = seeMore && canCharTruncate;
    const toggle = canToggle
      ? React.createElement(
          "span",
          {
            role: "button",
            tabIndex: 0,
            className: "ml-1 text-primary hover:underline cursor-pointer",
            onClick: () => setExpanded((e) => !e),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpanded((x) => !x);
              }
            },
          },
          expanded ? seeLessText : seeMoreText,
        )
      : null;

    const element = React.createElement(
      Tag,
      {
        ref,
        className: cn(variant, colorClass, weightClass, truncateClass, className),
        ...props,
      },
      canToggle ? React.createElement(React.Fragment, null, visibleContent, toggle) : visibleContent,
    );

    return element;
  },
);

Typography.displayName = "Typography";

/* ════════════════════════════════════════════════════════════════
   NAMED TAG COMPONENTS
   Usage: <H2 color="primary">text</H2>
   ════════════════════════════════════════════════════════════════ */

function tag(variant: TypographyVariant) {
  const C = React.forwardRef<HTMLElement, Omit<TypographyProps, "variant">>(
    (props, ref) => <Typography ref={ref} variant={variant} {...props} />,
  );
  C.displayName = variant;
  return C;
}

const Title1 = tag("title-1");
const Title2 = tag("title-2");
const Title3 = tag("title-3");

const H1 = tag("h1");
const H2 = tag("h2");
const H3 = tag("h3");
const H4 = tag("h4");
const H5 = tag("h5");
const H6 = tag("h6");

const Body1 = tag("body-1");
const Body2 = tag("body-2");
const Body3 = tag("body-3");
const Body4 = tag("body-4");

const Label1 = tag("label-1");
const Label2 = tag("label-2");
const Label3 = tag("label-3");

const Caption1 = tag("caption-1");
const Caption2 = tag("caption-2");

/* ════════════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════════════ */

export {
  Typography,
  Title1,
  Title2,
  Title3,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Body1,
  Body2,
  Body3,
  Body4,
  Label1,
  Label2,
  Label3,
  Caption1,
  Caption2,
};