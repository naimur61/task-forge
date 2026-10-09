#!/usr/bin/env node

/**
 * Nexstruct Theme Generator
 *
 * Regenerates src/app/globals.css from the shared palette.
 *
 * Usage: npm run theme
 *
 * The palette lives in src/lib/theme/palette.json — the single source of
 * truth for every color in the app. Edit it, then run `npm run theme`.
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════
// PALETTE (single source of truth)
// ═══════════════════════════════════════════════════════════

const PALETTE_PATH = resolve(ROOT, 'src/lib/theme/palette.json');
if (!existsSync(PALETTE_PATH)) {
  console.error('  ✗ palette.json not found at', PALETTE_PATH);
  process.exit(1);
}

const palette = JSON.parse(readFileSync(PALETTE_PATH, 'utf-8'));

const THEME = {
  // ─── Brand Colors ───
  primary: palette.brand.primary,
  secondary: palette.brand.secondary,
  accent: palette.brand.accent,

  // ─── Surface Colors (light) ───
  light: {
    background: palette.light.background,
    foreground: palette.light.foreground,
    card: palette.light.card,
    muted: palette.light.muted,
    mutedForeground: palette.light.mutedForeground,
    border: palette.light.border,
    input: palette.light.input,
    popover: palette.light.popover,
    destructive: palette.light.destructive,
    success: palette.light.success,
    warning: palette.light.warning,
    info: palette.light.info,
  },

  // ─── Surface Colors (dark) ───
  dark: {
    background: palette.dark.background,
    foreground: palette.dark.foreground,
    card: palette.dark.card,
    muted: palette.dark.muted,
    mutedForeground: palette.dark.mutedForeground,
    border: palette.dark.border,
    input: palette.dark.input,
    popover: palette.dark.popover,
    destructive: palette.dark.destructive,
    success: palette.dark.success,
    warning: palette.dark.warning,
    info: palette.dark.info,
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER: hex to HSL
// ═══════════════════════════════════════════════════════════

function hexToHsl(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, Math.round(l * 100)];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let hDegrees;
  switch (max) {
    case r:
      hDegrees = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      hDegrees = ((b - r) / d + 2) / 6;
      break;
    case b:
      hDegrees = ((r - g) / d + 4) / 6;
      break;
    default:
      hDegrees = 0;
  }

  return [
    Math.round(hDegrees * 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
}

// ═══════════════════════════════════════════════════════════
// SHADE GENERATION (50–950)
// ═══════════════════════════════════════════════════════════

function generateShades(baseHex, isDark = false) {
  const hsl = hexToHsl(baseHex);
  const [h, s, l] = hsl;

  const lightnessValues = isDark
    ? { 50: Math.max(l - 40, 5), 100: Math.max(l - 35, 8), 200: Math.max(l - 30, 10), 300: Math.max(l - 20, 15), 400: Math.max(l - 10, 20), 500: l, 600: Math.min(l + 10, 75), 700: Math.min(l + 20, 85), 800: Math.min(l + 30, 90), 900: Math.min(l + 35, 95), 950: Math.min(l + 40, 97) }
    : { 50: Math.min(l + 40, 97), 100: Math.min(l + 35, 95), 200: Math.min(l + 30, 90), 300: Math.min(l + 20, 85), 400: Math.min(l + 10, 75), 500: l, 600: Math.max(l - 10, 20), 700: Math.max(l - 20, 15), 800: Math.max(l - 30, 10), 900: Math.max(l - 35, 8), 950: Math.max(l - 40, 5) };

  const shades = {};
  for (const [shadeStr, lightness] of Object.entries(lightnessValues)) {
    shades[`--primary-${shadeStr}`] = `${h} ${s}% ${Math.round(lightness)}%`;
  }
  return shades;
}

// ═══════════════════════════════════════════════════════════
// CSS GENERATION (entire globals.css, deterministic + idempotent)
// ═══════════════════════════════════════════════════════════

const SCROLLBAR_CSS = `
  /* Beautiful themed scrollbar */
  html {
    scroll-behavior: smooth;
  }

  /* Firefox */
  html {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--scrollbar-thumb, var(--muted-foreground)) / 0.4) transparent;
  }

  /* Webkit */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-button {
    display: none !important;
  }
  ::-webkit-scrollbar-button:vertical:start,
  ::-webkit-scrollbar-button:vertical:end,
  ::-webkit-scrollbar-button:horizontal:start,
  ::-webkit-scrollbar-button:horizontal:end,
  ::-webkit-scrollbar-button:vertical:decrement,
  ::-webkit-scrollbar-button:vertical:increment,
  ::-webkit-scrollbar-button:horizontal:decrement,
  ::-webkit-scrollbar-button:horizontal:increment {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  ::-webkit-scrollbar-track-piece:vertical:start,
  ::-webkit-scrollbar-track-piece:vertical:end,
  ::-webkit-scrollbar-track-piece:horizontal:start,
  ::-webkit-scrollbar-track-piece:horizontal:end {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  ::-webkit-scrollbar-thumb {
    background-color: hsl(var(--scrollbar-thumb, var(--muted-foreground)) / 0.3);
    border-radius: 3px;
    border: 1px solid transparent;
    background-clip: content-box;
    transition: background-color 0.2s ease;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--scrollbar-thumb, var(--muted-foreground)) / 0.6);
  }
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* For code blocks / overflow containers */
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  .scrollbar-thin::-webkit-scrollbar-button {
    display: none !important;
  }
  .scrollbar-thin::-webkit-scrollbar-button:vertical:start,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:end,
  .scrollbar-thin::-webkit-scrollbar-button:horizontal:start,
  .scrollbar-thin::-webkit-scrollbar-button:horizontal:end,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:decrement,
  .scrollbar-thin::-webkit-scrollbar-button:vertical:increment,
  .scrollbar-thin::-webkit-scrollbar-button:horizontal:decrement,
  .scrollbar-thin::-webkit-scrollbar-button:horizontal:increment {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  .scrollbar-thin::-webkit-scrollbar-track-piece:vertical:start,
  .scrollbar-thin::-webkit-scrollbar-track-piece:vertical:end,
  .scrollbar-thin::-webkit-scrollbar-track-piece:horizontal:start,
  .scrollbar-thin::-webkit-scrollbar-track-piece:horizontal:end {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--scrollbar-thumb, var(--muted-foreground)) / 0.25);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--scrollbar-thumb, var(--muted-foreground)) / 0.5);
  }

  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
`;

function generateCss() {
  const lines = [];
  const darkLines = [];

  const addVar = (target, name, hex) => {
    const [h, s, l] = hexToHsl(hex);
    target.push(`    --${name}: ${h} ${s}% ${l}%;`);
  };

  // Brand base
  addVar(lines, 'primary', THEME.primary);
  addVar(darkLines, 'primary', THEME.primary);

  // Brand shades for light mode
  for (const [key, val] of Object.entries(generateShades(THEME.primary, false))) {
    lines.push(`    ${key}: ${val};`);
  }
  // Brand shades for dark mode
  for (const [key, val] of Object.entries(generateShades(THEME.primary, true))) {
    darkLines.push(`    ${key}: ${val};`);
  }

  // Secondary + accent
  addVar(lines, 'secondary', THEME.secondary);
  addVar(darkLines, 'secondary', THEME.secondary);
  // `accent` is a subtle surface for hover/selected states (not the brand color).
  // The brand's accent color is exposed as `highlight` (bg-highlight, text-highlight).
  addVar(lines, 'accent', THEME.light.muted);
  addVar(darkLines, 'accent', THEME.dark.muted);
  addVar(lines, 'highlight', THEME.accent);
  addVar(darkLines, 'highlight', THEME.accent);
  addVar(lines, 'highlight-foreground', '#ffffff');
  addVar(darkLines, 'highlight-foreground', '#ffffff');

  // Light mode surfaces
  addVar(lines, 'background', THEME.light.background);
  addVar(lines, 'foreground', THEME.light.foreground);
  addVar(lines, 'card', THEME.light.card);
  addVar(lines, 'card-foreground', THEME.light.foreground);
  addVar(lines, 'popover', THEME.light.popover);
  addVar(lines, 'popover-foreground', THEME.light.foreground);
  addVar(lines, 'muted', THEME.light.muted);
  addVar(lines, 'muted-foreground', THEME.light.mutedForeground);
  addVar(lines, 'border', THEME.light.border);
  addVar(lines, 'input', THEME.light.input);
  addVar(lines, 'success', THEME.light.success);
  addVar(lines, 'warning', THEME.light.warning);
  addVar(lines, 'destructive', THEME.light.destructive);
  addVar(lines, 'info', THEME.light.info);
  addVar(lines, 'primary-foreground', '#ffffff');
  addVar(lines, 'secondary-foreground', '#ffffff');
  addVar(lines, 'accent-foreground', THEME.light.foreground);
  addVar(lines, 'success-foreground', '#ffffff');
  addVar(lines, 'warning-foreground', '#ffffff');
  addVar(lines, 'info-foreground', '#ffffff');
  addVar(lines, 'destructive-foreground', '#ffffff');
  addVar(lines, 'ring', THEME.primary);

  // Dark mode surfaces
  addVar(darkLines, 'background', THEME.dark.background);
  addVar(darkLines, 'foreground', THEME.dark.foreground);
  addVar(darkLines, 'card', THEME.dark.card);
  addVar(darkLines, 'card-foreground', THEME.dark.foreground);
  addVar(darkLines, 'popover', THEME.dark.popover);
  addVar(darkLines, 'popover-foreground', THEME.dark.foreground);
  addVar(darkLines, 'muted', THEME.dark.muted);
  addVar(darkLines, 'muted-foreground', THEME.dark.mutedForeground);
  addVar(darkLines, 'border', THEME.dark.border);
  addVar(darkLines, 'input', THEME.dark.input);
  addVar(darkLines, 'success', THEME.dark.success);
  addVar(darkLines, 'warning', THEME.dark.warning);
  addVar(darkLines, 'destructive', THEME.dark.destructive);
  addVar(darkLines, 'info', THEME.dark.info);
  addVar(darkLines, 'primary-foreground', THEME.dark.foreground);
  addVar(darkLines, 'secondary-foreground', THEME.dark.foreground);
  addVar(darkLines, 'accent-foreground', THEME.dark.foreground);
  addVar(darkLines, 'success-foreground', '#ffffff');
  addVar(darkLines, 'warning-foreground', '#ffffff');
  addVar(darkLines, 'info-foreground', '#ffffff');
  addVar(darkLines, 'destructive-foreground', '#ffffff');
  addVar(darkLines, 'ring', THEME.primary);

  // Shared sizing + scrollbar (neutrals so the thumb matches the UI)
  lines.push('    --radius: 0.5rem;');
  darkLines.push('    --radius: 0.5rem;');
  addVar(lines, 'scrollbar-thumb', THEME.light.mutedForeground);
  addVar(darkLines, 'scrollbar-thumb', THEME.dark.mutedForeground);

  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════════════════════════════════════════════════
   🎨 THEME — Auto-generated from src/lib/theme/palette.json
   ═══════════════════════════════════════════════════════════

   HOW TO CUSTOMIZE:
   1. Open src/lib/theme/palette.json
   2. Change hex values (brand + light/dark surfaces)
   3. Run: npm run theme

   COLOR FORMAT: "H S L" (Hue Saturation Lightness)
   ═══════════════════════════════════════════════════════════ */

@layer base {
  html {
    @apply transition-colors duration-300;
  }
}

@layer base {
  :root {
${lines.join('\n')}
  }

  .dark {
${darkLines.join('\n')}
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer base {
${SCROLLBAR_CSS}
}
`;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

function main() {
  console.log('\n  🎨 Nexstruct Theme Generator');
  console.log('  ──────────────────────────────\n');

  const globalsPath = resolve(ROOT, 'src/app/globals.css');

  if (!existsSync(globalsPath)) {
    console.error('  ✗ globals.css not found at', globalsPath);
    process.exit(1);
  }

  writeFileSync(globalsPath, generateCss(), 'utf-8');
  console.log('  ✓ Theme CSS generated successfully!');
  console.log('  ✓ Updated src/app/globals.css\n');
  console.log('  Colors used:');
  console.log(`    Primary:   ${THEME.primary}`);
  console.log(`    Secondary: ${THEME.secondary}`);
  console.log(`    Accent:    ${THEME.accent}`);
  console.log('\n  ──────────────────────────────');
  console.log('  Tip: Edit src/lib/theme/palette.json');
  console.log('  Then run: npm run theme\n');
}

main();
