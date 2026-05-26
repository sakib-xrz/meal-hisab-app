import { apiRequest } from "@/lib/api/client";
import type { LeaveMessResponse, Mess, MessStats } from "@/lib/api/types";

export function createMess(input: {
  name: string;
  address?: string;
  phone?: string;
}) {
  return apiRequest<Mess>("/messes", {
    method: "POST",
    body: input,
  });
}

export function getCurrentMess() {
  return apiRequest<Mess>("/messes/current", { tenant: true });
}

export function getMessStats() {
  return apiRequest<MessStats>("/messes/stats", { tenant: true });
}

export function updateCurrentMess(input: {
  name?: string;
  address?: string | null;
  phone?: string | null;
  isActive?: boolean;
}) {
  return apiRequest<Mess>("/messes/current", {
    method: "PATCH",
    body: input,
    tenant: true,
  });
}

export function deleteCurrentMess() {
  return apiRequest<{ id: string }>("/messes/current", {
    method: "DELETE",
    tenant: true,
  });
}

export function transferOwnership(newOwnerMemberId: string) {
  return apiRequest<Mess>("/messes/transfer-ownership", {
    method: "PATCH",
    body: { newOwnerMemberId },
    tenant: true,
  });
}

export function leaveMess() {
  return apiRequest<LeaveMessResponse>("/messes/leave", {
    method: "POST",
    tenant: true,
  });
}
