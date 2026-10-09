#!/usr/bin/env node

/**
 * Apply a named color preset to the project.
 *
 * Usage:  npm run theme:preset -- <name>
 * Example: npm run theme:preset -- emerald
 *
 * What it does:
 *   1. Reads src/lib/theme/presets/<name>.json
 *   2. Copies it over src/lib/theme/palette.json (the active palette)
 *   3. Regenerates src/app/globals.css from the new palette
 *
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const name = process.argv[2];

const PRESETS_DIR = resolve(ROOT, 'src/lib/theme/presets');
const PALETTE_PATH = resolve(ROOT, 'src/lib/theme/palette.json');

if (!name) {
  console.error('\n  ✗ Usage: npm run theme:preset -- <preset-name>\n');
  printAvailablePresets();
  process.exit(1);
}

const presetPath = resolve(PRESETS_DIR, `${name}.json`);

if (!existsSync(presetPath)) {
  console.error(`\n  ✗ Unknown preset "${name}"\n`);
  printAvailablePresets();
  process.exit(1);
}

const preset = JSON.parse(readFileSync(presetPath, 'utf-8'));
writeFileSync(PALETTE_PATH, JSON.stringify(preset, null, 2) + '\n', 'utf-8');

console.log(`\n  🎨 Applied theme preset: ${name}`);
console.log('  ✓ Updated src/lib/theme/palette.json\n');

// Regenerate globals.css from the new palette (theme.mjs runs on import)
await import('./theme.mjs');

function printAvailablePresets() {
  const presets = readdirSync(PRESETS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'))
    .sort();
  console.log('  Available presets:');
  for (const p of presets) {
    console.log(`    • ${p}`);
  }
  console.log('');
}
