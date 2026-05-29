import { ApiError, apiRequest } from "@/lib/api/client";
import { resolveRoleKey } from "@/lib/api/normalize";
import type { Member, MemberApiRow, RoleKey } from "@/lib/api/types";
import { resolveAssetUrl } from "@/lib/utils/assets";
import { normalizeApiDate } from "@/lib/utils/dates";

export type AddMemberInput = {
  fullName?: string;
  phone?: string;
  email?: string;
  roomNo?: string;
  roleKey?: RoleKey;
  joiningDate?: string;
};

const pendingAddMemberRequests = new Map<string, Promise<Member>>();

function normalizeAddMemberKey(input: AddMemberInput) {
  return JSON.stringify({
    fullName: input.fullName?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    email: input.email?.trim() ?? "",
    roomNo: input.roomNo?.trim() ?? "",
    roleKey: input.roleKey ?? "",
    joiningDate: input.joiningDate?.trim() ?? "",
  });
}

function normalizePhoneDigits(phone?: string | null) {
  return phone?.replace(/\D/g, "") ?? "";
}

function isSamePhone(left?: string | null, right?: string | null) {
  const leftDigits = normalizePhoneDigits(left);
  const rightDigits = normalizePhoneDigits(right);

  if (!leftDigits || !rightDigits) {
    return false;
  }

  return leftDigits.endsWith(rightDigits) || rightDigits.endsWith(leftDigits);
}

export function isDuplicateMemberError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  return (
    code.includes("duplicate") ||
    code.includes("already_exists") ||
    message.includes("phone number already exists") ||
    (message.includes("phone") && message.includes("already exists"))
  );
}

async function findExistingMemberByPhone(phone: string) {
  const members = await listMembers({ status: "ACTIVE", limit: 500 });
  return members.find((member) => isSamePhone(member.phone, phone)) ?? null;
}

function normalizeMember(row: MemberApiRow): Member {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    roomNo: row.roomNo,
    roleKey: row.roleKey ?? resolveRoleKey(row.role) ?? "MEMBER",
    status: row.status,
    joiningDate: row.joiningDate ? normalizeApiDate(row.joiningDate) : row.joiningDate,
    leavingDate: row.leavingDate ? normalizeApiDate(row.leavingDate) : row.leavingDate,
    avatarUrl: row.avatarUrl ? resolveAssetUrl(row.avatarUrl) : row.avatarUrl,
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

export function addMember(input: AddMemberInput) {
  const requestKey = normalizeAddMemberKey(input);
  const pendingRequest = pendingAddMemberRequests.get(requestKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = apiRequest<MemberApiRow>("/messes/members", {
    method: "POST",
    body: input,
    tenant: true,
  })
    .then(normalizeMember)
    .catch(async (error) => {
      if (input.phone && isDuplicateMemberError(error)) {
        const existingMember = await findExistingMemberByPhone(input.phone);

        if (existingMember) {
          return existingMember;
        }
      }

      throw error;
    })
    .finally(() => {
      pendingAddMemberRequests.delete(requestKey);
    });

  pendingAddMemberRequests.set(requestKey, request);

  return request;
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
