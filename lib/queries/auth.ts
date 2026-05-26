import { useMutation } from "@tanstack/react-query";

import {
  changePassword,
  deleteAvatar,
  updateAvatar,
  updateProfile,
} from "@/lib/api/auth";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useUpdateAvatar() {
  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) => updateAvatar(file),
  });
}

export function useDeleteAvatar() {
  return useMutation({
    mutationFn: deleteAvatar,
  });
}
