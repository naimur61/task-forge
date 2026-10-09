/**
 * ═══════════════════════════════════════════════════════════
 * 📅 Date / Time Utilities
 * ═══════════════════════════════════════════════════════════
 *
 * Collection of date and time formatting functions extracted
 * from the main utils file for modular organization.
 *
 * ═══════════════════════════════════════════════════════════
 */

import type { DateOptions, DateTimeOptions, CustomDateFormat } from './types';

/**
 * Format a date into a human-readable string e.g. "June 17, 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Returns a relative time string e.g. "just now", "3m ago", "2h ago", "5d ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Returns the month and year e.g. "Jun 2025"
 */
export function toMonthYear(
  input: string | number | Date,
  options: DateOptions = {},
): string {
  const { local = false } = options;
  let date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (local && typeof input === 'string' && input.includes('Z')) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Returns time in 12-hour format e.g. "2:30 PM"
 * When showRelative is true, returns "Today, 2:30 PM" etc.
 */
export function time12h(
  input: string | Date,
  options: DateOptions = {},
  showRelative: boolean | 'day' = false,
): string {
  const { local = false } = options;
  let date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (local && typeof input === 'string' && input.includes('Z')) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  if (!showRelative) return timeString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (showRelative === 'day' && diffDays > 7) {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);
    return `${dateStr}, ${timeString}`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDate.getTime() === today.getTime()) {
    return `Today, ${timeString}`;
  }
  if (inputDate.getTime() === today.getTime() - 86_400_000) {
    return `Yesterday, ${timeString}`;
  }
  if (diffDays < 7) {
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
    return `${dayName}, ${timeString}`;
  }

  const dateStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);
  return `${dateStr}, ${timeString}`;
}

/**
 * Returns time in 24-hour format e.g. "14:30"
 */
export function time24h(
  input: string | Date,
  options: DateOptions = {},
): string {
  const { local = false } = options;
  let date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (local && typeof input === 'string' && input.includes('Z')) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Returns a date in a custom format: "YYYY-MM-DD", "DD-MM-YYYY", or "YYYY"
 */
export function customFormatDate(
  input: Date | string,
  format: CustomDateFormat = 'YYYY-MM-DD',
  options: DateOptions = {},
): string {
  const { local = false } = options;
  let date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (local && typeof input === 'string' && input.includes('Z')) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY':
      return String(y);
    case 'DD-MM-YYYY':
      return `${d}-${m}-${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

/**
 * Returns a full date-time string e.g. "24 August 2025, 03:30 PM"
 */
export function fullDateTime(
  input: Date | string,
  options: DateTimeOptions = {},
): string {
  const { showTime = true, local = false } = options;
  let date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (local && typeof input === 'string' && input.includes('Z')) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(showTime && { hour: '2-digit', minute: '2-digit', hour12: true }),
  }).format(date);
}

/**
 * Returns a duration string between two dates e.g. "2 years 3 months"
 */
export function duration(start: Date | string, end?: Date | string | null): string {
  const e = !end || end === 'no' ? new Date() : new Date(end);
  const s = new Date(start);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Invalid Date';
  if (e < s) return 'End date is before start date';

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();

  if (months < 0) { years--; months += 12; }

  const diffMs = e.getTime() - s.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const seconds = Math.floor(diffMs / 1000) % 60;

  if (years > 0) return months > 0 ? `${years}y ${months}m` : `${years}y`;
  if (months > 0) return `${months}m`;
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  return `${seconds}s`;
}

/**
 * Converts a local Date to ISO string at UTC midnight
 */
export function localDateToISO(date?: Date | null): string | null {
  if (!date) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)).toISOString();
}

/**
 * Returns "20-10-2025 at 10:07 am" format
 */
export function localDateTime(input: string | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).toLowerCase().replace(' ', '');

  return `${day}-${month}-${year} at ${time}`;
}
