import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
} from "date-fns";

export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEE, MMM d, yyyy");
}

export function getMonthRange(date: Date = new Date()) {
  return {
    from: toApiDate(startOfMonth(date)),
    to: toApiDate(endOfMonth(date)),
  };
}

export function shiftDate(dateStr: string, days: number): string {
  return toApiDate(addDays(parseISO(dateStr), days));
}

export function todayApiDate(): string {
  return toApiDate(new Date());
}
