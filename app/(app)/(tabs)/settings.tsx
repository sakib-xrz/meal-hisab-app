import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button, Label } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { ApiError } from "@/lib/api/client";
import {
  useChangePassword,
  useDeleteAvatar,
  useUpdateAvatar,
  useUpdateProfile,
} from "@/lib/queries/auth";
import {
  useCurrentMess,
  useDeleteCurrentMess,
  useLeaveMess,
  useUpdateCurrentMess,
} from "@/lib/queries/mess";
import { useAuth } from "@/context/auth-provider";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const messSchema = z.object({
  name: z.string().min(2, "Mess name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

export default function SettingsScreen() {
  const {
    user,
    myRole,
    isOwner,
    isManagerOrAbove,
    signOut,
    refreshUser,
    clearMess,
  } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showMessForm, setShowMessForm] = useState(false);

  const messQuery = useCurrentMess();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const updateMessMutation = useUpdateCurrentMess();
  const leaveMessMutation = useLeaveMess();
  const deleteMessMutation = useDeleteCurrentMess();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const messForm = useForm<z.infer<typeof messSchema>>({
    resolver: zodResolver(messSchema),
    defaultValues: { name: "", address: "", phone: "", isActive: true },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name });
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (messQuery.data) {
      messForm.reset({
        name: messQuery.data.name,
        address: messQuery.data.address ?? "",
        phone: messQuery.data.phone ?? "",
        isActive: messQuery.data.isActive,
      });
    }
  }, [messQuery.data, messForm]);

  const onSaveProfile = async (values: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(
      { name: values.name },
      {
        onSuccess: async () => {
          await refreshUser();
          Toast.show({ type: "success", text1: "Profile updated" });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          passwordForm.reset();
          setShowPasswordForm(false);
          Toast.show({ type: "success", text1: "Password changed" });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Password change failed",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const onSaveMess = async (values: z.infer<typeof messSchema>) => {
    updateMessMutation.mutate(
      {
        name: values.name,
        address: values.address || null,
        phone: values.phone || null,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          setShowMessForm(false);
          Toast.show({ type: "success", text1: "Mess updated" });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Photo library permission required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    updateAvatarMutation.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? "avatar.jpg",
        type: asset.mimeType ?? "image/jpeg",
      },
      {
        onSuccess: async () => {
          await refreshUser();
          Toast.show({ type: "success", text1: "Avatar updated" });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Avatar upload failed",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const handleDeleteAvatar = () => {
    Alert.alert("Remove avatar", "Delete your profile photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteAvatarMutation.mutate(undefined, {
            onSuccess: async () => {
              await refreshUser();
              Toast.show({ type: "success", text1: "Avatar removed" });
            },
            onError: (err) => {
              Toast.show({
                type: "error",
                text1: "Remove failed",
                text2: err instanceof ApiError ? err.message : "Something went wrong",
              });
            },
          });
        },
      },
    ]);
  };

  const handleLeaveMess = () => {
    Alert.alert("Leave mess", "Leave this mess? You will lose access.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          leaveMessMutation.mutate(undefined, {
            onSuccess: async () => {
              await clearMess();
              router.replace("/(onboarding)/create-mess");
              Toast.show({ type: "success", text1: "Left mess" });
            },
            onError: (err) => {
              Toast.show({
                type: "error",
                text1: "Could not leave mess",
                text2: err instanceof ApiError ? err.message : "Something went wrong",
              });
            },
          });
        },
      },
    ]);
  };

  const handleDeleteMess = () => {
    Alert.alert(
      "Delete mess",
      "Permanently delete this mess and all its data? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMessMutation.mutate(undefined, {
              onSuccess: async () => {
                await clearMess();
                router.replace("/(onboarding)/create-mess");
                Toast.show({ type: "success", text1: "Mess deleted" });
              },
              onError: (err) => {
                Toast.show({
                  type: "error",
                  text1: "Delete failed",
                  text2: err instanceof ApiError ? err.message : "Something went wrong",
                });
              },
            });
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Screen title="Settings">
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.meta}>{user?.phone}</Text>
        <Text style={styles.meta}>Role: {myRole ?? "—"}</Text>

        <View style={styles.avatarRow}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View style={styles.avatarActions}>
            <Button
              title="Change photo"
              variant="secondary"
              loading={updateAvatarMutation.isPending}
              onPress={pickAvatar}
            />
            {user?.avatarUrl ? (
              <Button title="Remove photo" variant="secondary" onPress={handleDeleteAvatar} />
            ) : null}
          </View>
        </View>

        <Label>Name</Label>
        <Controller
          control={profileForm.control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={profileForm.formState.errors.name?.message}
            />
          )}
        />
        <View style={styles.gapTop}>
          <Button
            title="Save profile"
            variant="secondary"
            loading={updateProfileMutation.isPending}
            onPress={profileForm.handleSubmit(onSaveProfile)}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <Button
          title={showPasswordForm ? "Cancel password change" : "Change password"}
          variant="secondary"
          onPress={() => setShowPasswordForm((v) => !v)}
        />
        {showPasswordForm ? (
          <View style={styles.formBlock}>
            <Controller
              control={passwordForm.control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Current password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="New password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Confirm new password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              title="Update password"
              loading={changePasswordMutation.isPending}
              onPress={passwordForm.handleSubmit(onChangePassword)}
            />
          </View>
        ) : null}
      </Card>

      {messQuery.data ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Current mess</Text>
          <Text style={styles.messName}>{messQuery.data.name}</Text>
          {messQuery.data.address ? (
            <Text style={styles.meta}>{messQuery.data.address}</Text>
          ) : null}
          {messQuery.data.phone ? (
            <Text style={styles.meta}>{messQuery.data.phone}</Text>
          ) : null}
          {messQuery.data.owner ? (
            <Text style={styles.meta}>Owner: {messQuery.data.owner.name}</Text>
          ) : null}
          <Text style={styles.meta}>
            {messQuery.data.activeMemberCount ?? 0} active members ·{" "}
            {messQuery.data.isActive ? "Active" : "Inactive"}
          </Text>
        </Card>
      ) : null}

      {isManagerOrAbove ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mess settings</Text>
          <Button
            title={showMessForm ? "Cancel" : "Edit mess"}
            variant="secondary"
            onPress={() => setShowMessForm((v) => !v)}
          />
          {showMessForm ? (
            <View style={styles.formBlock}>
              <Controller
                control={messForm.control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Mess name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={messForm.formState.errors.name?.message}
                  />
                )}
              />
              <Controller
                control={messForm.control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <Controller
                control={messForm.control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Contact phone"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mess is active</Text>
                <Controller
                  control={messForm.control}
                  name="isActive"
                  render={({ field: { onChange, value } }) => (
                    <Switch value={value} onValueChange={onChange} />
                  )}
                />
              </View>
              <Button
                title="Save mess"
                loading={updateMessMutation.isPending}
                onPress={messForm.handleSubmit(onSaveMess)}
              />
            </View>
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Membership</Text>
        {isOwner ? (
          <>
            <Button
              title="Transfer ownership"
              variant="secondary"
              onPress={() => router.push("/(app)/settings/transfer-ownership")}
            />
            <View style={styles.gapTop}>
              <Button title="Delete mess" variant="danger" onPress={handleDeleteMess} />
            </View>
          </>
        ) : (
          <Button title="Leave mess" variant="danger" onPress={handleLeaveMess} />
        )}
      </Card>

      <Button title="Sign out" variant="danger" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  meta: { color: "#6b7280", marginBottom: 4 },
  messName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: "#374151",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 28, fontWeight: "600", color: "#6b7280" },
  avatarActions: { flex: 1, gap: 8 },
  formBlock: { gap: 12, marginTop: 12 },
  gapTop: { marginTop: 12 },
});
