// Date utility helpers for due date handling
// All dates stored as date-only strings in format YYYY-MM-DD (UTC-agnostic)

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Validate a candidate due date string (YYYY-MM-DD) */
export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!DATE_ONLY_REGEX.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Today in YYYY-MM-DD (using current local date) */
export function todayDateOnly(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Determine if a date-only string is strictly before today */
export function isOverdue(dueDate?: string): boolean {
  if (!dueDate || !isValidDateOnly(dueDate)) return false;
  return dueDate < todayDateOnly();
}

/** Normalize arbitrary input into a valid date-only string or undefined */
export function sanitizeDueDate(input: unknown): string | undefined {
  return isValidDateOnly(input) ? input : undefined;
}
