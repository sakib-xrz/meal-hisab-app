import { apiFormDataRequest, apiRequest } from "@/lib/api/client";
import { normalizeUser, type ApiUser } from "@/lib/api/normalize";
import type { AuthPayload, User } from "@/lib/api/types";

export function register(input: {
  name: string;
  phone: string;
  password: string;
  avatarUrl?: string;
}) {
  return apiRequest<AuthPayload & { user: ApiUser }>("/auth/register", {
    method: "POST",
    body: input,
  }).then((result) => ({
    ...result,
    user: normalizeUser(result.user),
  }));
}

export function login(input: { phone: string; password: string }) {
  return apiRequest<AuthPayload & { user: ApiUser }>("/auth/login", {
    method: "POST",
    body: input,
  }).then((result) => ({
    ...result,
    user: normalizeUser(result.user),
  }));
}

export function getMe() {
  return apiRequest<ApiUser>("/auth/me").then(normalizeUser);
}

export function updateProfile(input: { name: string }) {
  return apiRequest<ApiUser>("/auth/profile", {
    method: "PATCH",
    body: input,
  }).then(normalizeUser);
}

export function updateAvatar(file: {
  uri: string;
  name: string;
  type: string;
}) {
  const formData = new FormData();
  formData.append("avatar", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  return apiFormDataRequest<ApiUser>("/auth/avatar", {
    method: "PATCH",
    formData,
  }).then(normalizeUser);
}

export function deleteAvatar() {
  return apiRequest<ApiUser>("/auth/avatar", {
    method: "DELETE",
  }).then(normalizeUser);
}

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiRequest<{ id: string }>("/auth/change-password", {
    method: "PATCH",
    body: input,
  });
}

export function logout() {
  return apiRequest<{ message?: string }>("/auth/logout", {
    method: "POST",
  });
}
