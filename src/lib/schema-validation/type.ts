/**
 * ═══════════════════════════════════════════════════════════
 * Schema Validation Types
 * ═══════════════════════════════════════════════════════════
 */

import type { z } from 'zod';

/**
 * Infer the type from a Zod schema
 */
export type InferSchemaType<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Generic validation result
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
