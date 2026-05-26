export type RoleKey = "OWNER" | "MANAGER" | "MEMBER";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "LEFT";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Membership {
  messId: string;
  roleKey: RoleKey;
  status: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  isSuperAdmin: boolean;
  memberships: Membership[];
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}

export interface MessOwner {
  id: string;
  name: string;
  phone: string;
}

export interface Mess {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  owner?: MessOwner;
  activeMemberCount?: number;
  isOwner?: boolean;
  myRole?: RoleKey;
}

export interface MessStats {
  period: { from: string; to: string };
  activeMemberCount: number;
  totalMeals: number;
  totalBazaarCost: number;
  totalExtraExpense: number;
  totalPayments: number;
  mealRate: number;
}

export interface Member {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  roomNo?: string | null;
  roleKey: RoleKey;
  status: MemberStatus;
  joiningDate?: string | null;
  leavingDate?: string | null;
  avatarUrl?: string | null;
}

/** Raw member row from GET /messes/members */
export interface MemberApiRow {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  roomNo?: string | null;
  role?: RoleKey | { key: RoleKey; id?: string; name?: string } | null;
  roleKey?: RoleKey;
  status: MemberStatus;
  joiningDate?: string | null;
  leavingDate?: string | null;
  avatarUrl?: string | null;
}

export interface MealMemberRow {
  memberId: string;
  fullName: string;
  roomNo?: string | null;
  mealEntryId?: string | null;
  breakfast: number;
  lunch: number;
  dinner: number;
  note?: string | null;
}

export interface MealSummary {
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
}

export interface DailyMealSheet {
  date: string;
  members: MealMemberRow[];
  summary: MealSummary;
}

export interface MealPeriodSummary {
  from: string;
  to: string;
  totalMeals: number;
  byMember: {
    memberId: string;
    fullName: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    total: number;
  }[];
  byDate: {
    date: string;
    breakfast: number;
    lunch: number;
    dinner: number;
    total: number;
  }[];
}

export interface MealEntry {
  id: string;
  memberId: string;
  mealDate: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
  note?: string | null;
  member: {
    fullName: string;
    roomNo?: string | null;
  };
}

export interface MealListResponse {
  from: string;
  to: string;
  entries: MealEntry[];
}

export interface LeaveMessResponse {
  messId: string;
  leftAt: string;
}
