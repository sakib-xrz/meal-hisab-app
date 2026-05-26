import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

export async function invalidateMembers(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.meals.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.mess.stats() });
}

export async function invalidateMeals(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.meals.all });
  await queryClient.invalidateQueries({ queryKey: queryKeys.mess.stats() });
}

export async function invalidateMess(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.mess.all });
}

export async function clearTenantQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: queryKeys.mess.all });
  queryClient.removeQueries({ queryKey: queryKeys.members.all });
  queryClient.removeQueries({ queryKey: queryKeys.meals.all });
}
