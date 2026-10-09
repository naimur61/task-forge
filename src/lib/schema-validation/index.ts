/**
 * ═══════════════════════════════════════════════════════════
 * ✅ Schema Validation Utilities
 * ═══════════════════════════════════════════════════════════
 *
 * Provides helper functions for validating data against Zod schemas.
 * These are used by form handling components and API mutation hooks.
 *
 * ═══════════════════════════════════════════════════════════
 */

import type { z } from 'zod';

/**
 * Validate data against a Zod schema
 */
export function validateSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
  };
}
