import type { Membership, RoleKey, User } from "@/lib/api/types";
import { resolveAssetUrl } from "@/lib/utils/assets";

type ApiRole = RoleKey | { key: RoleKey; id?: string; name?: string };

export type ApiMembership = {
  messId: string;
  roleKey?: RoleKey;
  role?: ApiRole;
  status: string;
};

export type ApiUser = Omit<User, "memberships"> & {
  memberships?: ApiMembership[];
};

export function resolveRoleKey(role?: ApiRole | null): RoleKey | undefined {
  if (!role) return undefined;
  if (typeof role === "string") return role;
  return role.key;
}

export function normalizeMembership(m: ApiMembership): Membership {
  return {
    messId: m.messId,
    roleKey: m.roleKey ?? resolveRoleKey(m.role) ?? "MEMBER",
    status: m.status,
  };
}

export function normalizeUser(raw: ApiUser): User {
  return {
    ...raw,
    avatarUrl: resolveAssetUrl(raw.avatarUrl),
    memberships: (raw.memberships ?? []).map(normalizeMembership),
  };
}
