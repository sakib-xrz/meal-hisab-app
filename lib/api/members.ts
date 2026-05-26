import { apiRequest } from "@/lib/api/client";
import { resolveRoleKey } from "@/lib/api/normalize";
import type { Member, MemberApiRow, RoleKey } from "@/lib/api/types";

function normalizeMember(row: MemberApiRow): Member {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    roomNo: row.roomNo,
    roleKey: row.roleKey ?? resolveRoleKey(row.role) ?? "MEMBER",
    status: row.status,
    joiningDate: row.joiningDate,
    leavingDate: row.leavingDate,
    avatarUrl: row.avatarUrl,
  };
}

export function listMembers(params?: {
  status?: string;
  roleKey?: RoleKey;
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: "createdAt" | "updatedAt" | "fullName" | "joiningDate";
  sort_order?: "asc" | "desc";
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.roleKey) searchParams.set("roleKey", params.roleKey);
  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 50));
  // Backend pagination defaults to invalid `created_at` unless sort_by is in the URL.
  searchParams.set("sort_by", params?.sort_by ?? "fullName");
  searchParams.set("sort_order", params?.sort_order ?? "asc");
  if (params?.search) searchParams.set("search", params.search);

  const path = `/messes/members?${searchParams.toString()}`;

  return apiRequest<MemberApiRow[]>(path, { tenant: true }).then((rows) =>
    Array.isArray(rows) ? rows.map(normalizeMember) : [],
  );
}

export function addMember(input: {
  fullName?: string;
  phone?: string;
  email?: string;
  roomNo?: string;
  roleKey?: RoleKey;
  joiningDate?: string;
}) {
  return apiRequest<MemberApiRow>("/messes/members", {
    method: "POST",
    body: input,
    tenant: true,
  }).then(normalizeMember);
}

export function updateMember(
  memberId: string,
  input: Partial<{
    fullName: string;
    phone: string | null;
    email: string | null;
    roomNo: string | null;
    roleKey: RoleKey;
    status: string;
    joiningDate: string | null;
    leavingDate: string | null;
  }>,
) {
  return apiRequest<MemberApiRow>(`/messes/members/${memberId}`, {
    method: "PATCH",
    body: input,
    tenant: true,
  }).then(normalizeMember);
}

export function removeMember(memberId: string) {
  return apiRequest<MemberApiRow>(`/messes/members/${memberId}`, {
    method: "DELETE",
    tenant: true,
  }).then(normalizeMember);
}
