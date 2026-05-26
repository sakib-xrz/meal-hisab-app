export const queryKeys = {
  mess: {
    all: ["mess"] as const,
    current: () => [...queryKeys.mess.all, "current"] as const,
    stats: () => [...queryKeys.mess.all, "stats"] as const,
  },
  members: {
    all: ["members"] as const,
    list: (params?: { status?: string; search?: string }) =>
      [...queryKeys.members.all, params?.status ?? "all", params?.search ?? ""] as const,
  },
  meals: {
    all: ["meals"] as const,
    daily: (date: string) => [...queryKeys.meals.all, "daily", date] as const,
    summary: (from: string, to: string) =>
      [...queryKeys.meals.all, "summary", from, to] as const,
    list: (from: string, to: string, memberId?: string) =>
      [...queryKeys.meals.all, "list", from, to, memberId ?? "all"] as const,
  },
} as const;
