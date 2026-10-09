import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ─────────────────────────────────────────────
 *  cn — Merge Tailwind classes
 * ───────────────────────────────────────────── */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─────────────────────────────────────────────
 *  String Utilities
 * ───────────────────────────────────────────── */

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Mask a string with a custom character, showing the first N and last N chars
 * e.g. maskString("HelloWorld", 3, 2) → "Hel**ld"
 */
export function maskString(
  value: string,
  showStart = 3,
  showEnd = 0,
  maskChar = '*',
): string {
  if (!value) return '';
  const length = value.length;
  if (showStart + showEnd >= length) return value;

  const start = value.slice(0, showStart);
  const end = value.slice(length - showEnd);
  const masked = maskChar.repeat(length - showStart - showEnd);

  return `${start}${masked}${end}`;
}

/**
 * Mask an email address e.g. "j***@example.com"
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return maskString(email, 1, 0, '*');
  return `${maskString(user, 1, 0, '*')}@${domain}`;
}

/* ─────────────────────────────────────────────
 *  Password Strength Rules
 * ───────────────────────────────────────────── */

export interface PasswordRule {
  label: string;
  test: (val: string) => boolean;
}

/**
 * Standard password validation rules used by the PasswordField when mode="validate"
 */
export const passwordRules: PasswordRule[] = [
  { label: 'At least 8 characters', test: (val) => val.length >= 8 },
  { label: 'At least one uppercase letter', test: (val) => /[A-Z]/.test(val) },
  { label: 'At least one number', test: (val) => /\d/.test(val) },
  { label: 'At least one special character', test: (val) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(val) },
  { label: 'No sequential numbers (e.g. 1234)', test: (val) => !/012|123|234|345|456|567|678|789/.test(val) },
];

/**
 * Check if a password passes all rules
 */
export function isPasswordStrong(password: string): boolean {
  return passwordRules.every((rule) => rule.test(password));
}

/* ─────────────────────────────────────────────
 *  Label & Placeholder Formatting
 * ───────────────────────────────────────────── */

const prepositions = [
  'is', 'the', 'within', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
  'a', 'an', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while',
  'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also',
];

export function LabelAndPlaceholderTextFormat(input: string): string {
  if (!input) return '';
  const capitalWords: string[] = [];

  return input
    .toLowerCase()
    .split(' ')
    .map((word: string, index: number) => {
      if (prepositions.includes(word) && index !== 0) return word;
      if (capitalWords.includes(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
