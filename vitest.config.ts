import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Unit tests live in tests/ (the folder names the role, so files have no .test suffix). */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.ts'],
    environment: 'node',
  },
});
