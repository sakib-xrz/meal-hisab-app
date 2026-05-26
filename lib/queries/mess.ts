import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMess,
  deleteCurrentMess,
  getCurrentMess,
  getMessStats,
  leaveMess,
  transferOwnership,
  updateCurrentMess,
} from "@/lib/api/mess";
import { queryKeys } from "@/lib/query-keys";
import {
  clearTenantQueries,
  invalidateMembers,
  invalidateMess,
} from "@/lib/queries/invalidate";

export function useCurrentMess() {
  return useQuery({
    queryKey: queryKeys.mess.current(),
    queryFn: getCurrentMess,
  });
}

export function useMessStats() {
  return useQuery({
    queryKey: queryKeys.mess.stats(),
    queryFn: getMessStats,
  });
}

export function useCreateMess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMess,
    onSuccess: async () => {
      await invalidateMess(queryClient);
    },
  });
}

export function useUpdateCurrentMess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentMess,
    onSuccess: async () => {
      await invalidateMess(queryClient);
    },
  });
}

export function useDeleteCurrentMess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCurrentMess,
    onSuccess: () => {
      clearTenantQueries(queryClient);
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOwnerMemberId: string) => transferOwnership(newOwnerMemberId),
    onSuccess: async () => {
      await invalidateMess(queryClient);
      await invalidateMembers(queryClient);
    },
  });
}

export function useLeaveMess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveMess,
    onSuccess: () => {
      clearTenantQueries(queryClient);
    },
  });
}
