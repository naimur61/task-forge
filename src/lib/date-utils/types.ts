/**
 * ═══════════════════════════════════════════════════════════
 * Date Utility Types
 * ═══════════════════════════════════════════════════════════
 */

export interface DateOptions {
  local?: boolean;
}

export interface DateTimeOptions extends DateOptions {
  showTime?: boolean;
}

export type CustomDateFormat = 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'YYYY';
