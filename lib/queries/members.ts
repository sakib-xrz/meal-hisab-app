import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addMember, listMembers, removeMember, updateMember } from "@/lib/api/members";
import type { RoleKey } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";
import { invalidateMembers } from "@/lib/queries/invalidate";

type ListMembersParams = {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  roleKey?: RoleKey;
  sort_by?: "createdAt" | "updatedAt" | "fullName" | "joiningDate";
  sort_order?: "asc" | "desc";
};

export function useMembers(params?: ListMembersParams) {
  return useQuery({
    queryKey: queryKeys.members.list(params),
    queryFn: () => listMembers(params),
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMember,
    onSuccess: async () => {
      await invalidateMembers(queryClient);
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      input,
    }: {
      memberId: string;
      input: Parameters<typeof updateMember>[1];
    }) => updateMember(memberId, input),
    onSuccess: async () => {
      await invalidateMembers(queryClient);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: async () => {
      await invalidateMembers(queryClient);
    },
  });
}
