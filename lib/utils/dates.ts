import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";

const API_DATE_RE = /^(\d{4}-\d{2}-\d{2})/;

/**
 * Normalize API date/datetime strings to a calendar date (yyyy-MM-dd).
 * Prisma @db.Date values arrive as UTC midnight — use UTC parts, not local.
 */
export function normalizeApiDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const d = String(parsed.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const match = trimmed.match(API_DATE_RE);
  return match?.[1] ?? trimmed;
}

/** Parse yyyy-MM-dd as a local calendar date (no timezone shift). */
export function parseApiDate(dateStr: string): Date {
  const normalized = normalizeApiDate(dateStr);
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseApiDate(dateStr), "EEE, MMM d, yyyy");
}

export function formatShortDate(dateStr: string): string {
  return format(parseApiDate(dateStr), "MMM d, yyyy");
}

export function getMonthRange(date: Date = new Date()) {
  return {
    from: toApiDate(startOfMonth(date)),
    to: toApiDate(endOfMonth(date)),
  };
}

export function shiftDate(dateStr: string, days: number): string {
  return toApiDate(addDays(parseApiDate(dateStr), days));
}

export function todayApiDate(): string {
  return toApiDate(new Date());
}

export function isSameApiDate(a: string, b: string): boolean {
  return normalizeApiDate(a) === normalizeApiDate(b);
}
