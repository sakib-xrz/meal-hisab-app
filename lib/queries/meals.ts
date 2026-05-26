import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteMealEntry,
  getDailyMealSheet,
  getMealsSummary,
  listMeals,
  saveDailyMealSheet,
  updateMealEntry,
} from "@/lib/api/meals";
import { queryKeys } from "@/lib/query-keys";
import { invalidateMeals } from "@/lib/queries/invalidate";

export function useDailyMealSheet(date: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.meals.daily(date),
    queryFn: () => getDailyMealSheet(date),
    enabled: enabled && Boolean(date),
  });
}

export function useSaveDailyMealSheet(date: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDailyMealSheet,
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.meals.daily(date), data);
      await invalidateMeals(queryClient);
    },
  });
}

export function useMealsSummary(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.meals.summary(from, to),
    queryFn: () => getMealsSummary(from, to),
  });
}

export function useMealsList(from: string, to: string, memberId?: string) {
  return useQuery({
    queryKey: queryKeys.meals.list(from, to, memberId),
    queryFn: () => listMeals({ from, to, memberId }),
  });
}

export function useUpdateMealEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mealEntryId,
      input,
    }: {
      mealEntryId: string;
      input: Parameters<typeof updateMealEntry>[1];
    }) => updateMealEntry(mealEntryId, input),
    onSuccess: async () => {
      await invalidateMeals(queryClient);
    },
  });
}

export function useDeleteMealEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMealEntry,
    onSuccess: async () => {
      await invalidateMeals(queryClient);
    },
  });
}
