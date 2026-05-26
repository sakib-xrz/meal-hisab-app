import { apiRequest } from "@/lib/api/client";
import type {
  DailyMealSheet,
  MealEntry,
  MealListResponse,
  MealMemberRow,
  MealPeriodSummary,
  MealSummary,
} from "@/lib/api/types";

function toMealCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

type ApiMealSummary = {
  breakfast?: number;
  lunch?: number;
  dinner?: number;
  total?: number;
  totalBreakfast?: number;
  totalLunch?: number;
  totalDinner?: number;
  totalMeals?: number;
};

function normalizeMealSummary(raw: ApiMealSummary): MealSummary {
  return {
    breakfast: toMealCount(raw.breakfast ?? raw.totalBreakfast),
    lunch: toMealCount(raw.lunch ?? raw.totalLunch),
    dinner: toMealCount(raw.dinner ?? raw.totalDinner),
    total: toMealCount(raw.total ?? raw.totalMeals),
  };
}

type ApiMealMemberRow = {
  memberId: string;
  fullName: string;
  roomNo?: string | null;
  mealEntryId?: string | null;
  breakfast?: unknown;
  lunch?: unknown;
  dinner?: unknown;
  note?: string | null;
};

function normalizeMealMemberRow(raw: ApiMealMemberRow): MealMemberRow {
  return {
    memberId: raw.memberId,
    fullName: raw.fullName,
    roomNo: raw.roomNo,
    mealEntryId: raw.mealEntryId,
    breakfast: toMealCount(raw.breakfast),
    lunch: toMealCount(raw.lunch),
    dinner: toMealCount(raw.dinner),
    note: raw.note,
  };
}

function normalizeDailyMealSheet(raw: {
  date: string;
  members?: ApiMealMemberRow[];
  summary?: ApiMealSummary;
}): DailyMealSheet {
  return {
    date: raw.date,
    members: (raw.members ?? []).map(normalizeMealMemberRow),
    summary: normalizeMealSummary(raw.summary ?? {}),
  };
}

type ApiMealEntry = Omit<MealEntry, "breakfast" | "lunch" | "dinner" | "total"> & {
  breakfast?: unknown;
  lunch?: unknown;
  dinner?: unknown;
  total?: unknown;
};

function normalizeMealEntry(raw: ApiMealEntry): MealEntry {
  const breakfast = toMealCount(raw.breakfast);
  const lunch = toMealCount(raw.lunch);
  const dinner = toMealCount(raw.dinner);

  return {
    ...raw,
    breakfast,
    lunch,
    dinner,
    total: toMealCount(raw.total ?? breakfast + lunch + dinner),
  };
}

type ApiMealPeriodSummary = {
  from: string;
  to: string;
  totalMeals?: number;
  totalBreakfast?: number;
  totalLunch?: number;
  totalDinner?: number;
  byMember?: {
    memberId: string;
    fullName: string;
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    total?: number;
    totalMeals?: number;
  }[];
  byDate?: {
    date: string;
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    total?: number;
    totalMeals?: number;
  }[];
};

function normalizeMealPeriodSummary(raw: ApiMealPeriodSummary): MealPeriodSummary {
  return {
    from: raw.from,
    to: raw.to,
    totalMeals: toMealCount(raw.totalMeals),
    byMember: (raw.byMember ?? []).map((member) => ({
      memberId: member.memberId,
      fullName: member.fullName,
      breakfast: toMealCount(member.breakfast),
      lunch: toMealCount(member.lunch),
      dinner: toMealCount(member.dinner),
      total: toMealCount(member.total ?? member.totalMeals),
    })),
    byDate: (raw.byDate ?? []).map((day) => ({
      date: day.date,
      breakfast: toMealCount(day.breakfast),
      lunch: toMealCount(day.lunch),
      dinner: toMealCount(day.dinner),
      total: toMealCount(day.total ?? day.totalMeals),
    })),
  };
}

export function getDailyMealSheet(date: string) {
  return apiRequest<{
    date: string;
    members?: ApiMealMemberRow[];
    summary?: ApiMealSummary;
  }>(`/messes/meals/daily?date=${date}`, {
    tenant: true,
  }).then(normalizeDailyMealSheet);
}

export function saveDailyMealSheet(input: {
  date: string;
  entries: {
    memberId: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    note?: string;
  }[];
}) {
  return apiRequest<{
    date: string;
    members?: ApiMealMemberRow[];
    summary?: ApiMealSummary;
  }>("/messes/meals/daily", {
    method: "PUT",
    body: input,
    tenant: true,
  }).then(normalizeDailyMealSheet);
}

export function getMealsSummary(from: string, to: string) {
  return apiRequest<ApiMealPeriodSummary>(
    `/messes/meals/summary?from=${from}&to=${to}`,
    { tenant: true },
  ).then(normalizeMealPeriodSummary);
}

export function listMeals(params: {
  from: string;
  to: string;
  memberId?: string;
}) {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
  });
  if (params.memberId) {
    search.set("memberId", params.memberId);
  }

  return apiRequest<Omit<MealListResponse, "entries"> & { entries?: ApiMealEntry[] }>(
    `/messes/meals?${search.toString()}`,
    {
      tenant: true,
    },
  ).then((raw) => ({
    from: raw.from,
    to: raw.to,
    entries: (raw.entries ?? []).map(normalizeMealEntry),
  }));
}

export function updateMealEntry(
  mealEntryId: string,
  input: {
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    note?: string | null;
  },
) {
  return apiRequest<ApiMealEntry>(`/messes/meals/${mealEntryId}`, {
    method: "PATCH",
    body: input,
    tenant: true,
  }).then(normalizeMealEntry);
}

export function deleteMealEntry(mealEntryId: string) {
  return apiRequest<ApiMealEntry>(`/messes/meals/${mealEntryId}`, {
    method: "DELETE",
    tenant: true,
  }).then(normalizeMealEntry);
}
