import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { FadeIn } from "@/components/ui/animated-view";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListRow } from "@/components/ui/list-row";
import { Screen } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@/context/auth-provider";
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
import * as ImagePicker from "expo-image-picker";

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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
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
                text2:
                  err instanceof ApiError
                    ? err.message
                    : "Something went wrong",
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
                text2:
                  err instanceof ApiError
                    ? err.message
                    : "Something went wrong",
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
                  text2:
                    err instanceof ApiError
                      ? err.message
                      : "Something went wrong",
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
      <FadeIn delay={50}>
        <Card variant="glass" className="mb-4">
          <View className="mb-4 flex-row items-center gap-4">
            <Avatar
              name={user?.name}
              uri={user?.avatarUrl}
              size="lg"
              key={user?.id ?? "avatar"}
            />
            <View className="flex-1">
              <Text
                className="font-sans text-xl font-bold text-foreground"
                numberOfLines={1}
              >
                {user?.name ?? "Your profile"}
              </Text>
              <Text
                className="mt-1 font-sans text-sm text-muted"
                numberOfLines={1}
              >
                {user?.phone}
              </Text>
              {myRole ? (
                <Badge label={myRole} variant="primary" className="mt-2" />
              ) : null}
            </View>
          </View>

          <View className="mb-4 flex-row gap-2">
            <View className="flex-1">
              <Button
                title="Change"
                variant="primary"
                leftIcon="photo-camera"
                loading={updateAvatarMutation.isPending}
                onPress={pickAvatar}
              />
            </View>
            {user?.avatarUrl ? (
              <View className="flex-1">
                <Button
                  title="Remove"
                  variant="danger"
                  leftIcon="delete-outline"
                  onPress={handleDeleteAvatar}
                />
              </View>
            ) : null}
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
          <View className="mt-3">
            <Button
              title="Save profile"
              variant="secondary"
              leftIcon="save"
              loading={updateProfileMutation.isPending}
              onPress={profileForm.handleSubmit(onSaveProfile)}
            />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <Card variant="glass" className="mb-4">
          <Button
            title={
              showPasswordForm ? "Cancel password change" : "Change password"
            }
            variant="secondary"
            leftIcon={showPasswordForm ? "close" : "lock-reset"}
            onPress={() => setShowPasswordForm((v) => !v)}
          />
          {showPasswordForm ? (
            <View className="mt-4 gap-3">
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
                    error={
                      passwordForm.formState.errors.confirmPassword?.message
                    }
                  />
                )}
              />
              <Button
                title="Update password"
                leftIcon="key"
                loading={changePasswordMutation.isPending}
                onPress={passwordForm.handleSubmit(onChangePassword)}
              />
            </View>
          ) : null}
        </Card>
      </FadeIn>

      {messQuery.data ? (
        <FadeIn delay={150}>
          <Card variant="glass" className="mb-4">
            <SectionHeader title="Current mess" className="mt-0" />
            <Text className="mb-2 font-sans text-lg font-semibold text-foreground">
              {messQuery.data.name}
            </Text>
            {messQuery.data.address ? (
              <Text className="mb-1 font-sans text-sm text-muted">
                {messQuery.data.address}
              </Text>
            ) : null}
            {messQuery.data.phone ? (
              <Text className="mb-1 font-sans text-sm text-muted">
                {messQuery.data.phone}
              </Text>
            ) : null}
            {messQuery.data.owner ? (
              <Text className="mb-2 font-sans text-sm text-muted">
                Owner: {messQuery.data.owner.name}
              </Text>
            ) : null}
            <Badge
              label={`${messQuery.data.activeMemberCount ?? 0} active - ${messQuery.data.isActive ? "Active" : "Inactive"}`}
              variant="muted"
            />
          </Card>
        </FadeIn>
      ) : null}

      {isManagerOrAbove ? (
        <FadeIn delay={200}>
          <Card variant="glass" className="mb-4">
            <SectionHeader title="Mess settings" className="mt-0" />
            <Button
              title={showMessForm ? "Cancel" : "Edit mess"}
              variant="secondary"
              leftIcon={showMessForm ? "close" : "edit"}
              onPress={() => setShowMessForm((v) => !v)}
            />
            {showMessForm ? (
              <View className="mt-4 gap-3">
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
                <View className="flex-row items-center justify-between py-1">
                  <Text className="font-sans text-base text-foreground-secondary">
                    Mess is active
                  </Text>
                  <Controller
                    control={messForm.control}
                    name="isActive"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        trackColor={{ true: "#0f766e", false: "#dbe5dc" }}
                      />
                    )}
                  />
                </View>
                <Button
                  title="Save mess"
                  leftIcon="save"
                  loading={updateMessMutation.isPending}
                  onPress={messForm.handleSubmit(onSaveMess)}
                />
              </View>
            ) : null}
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn delay={250}>
        <Card variant="glass" className="mb-4">
          <SectionHeader title="Membership" className="mt-0" />
          {isOwner ? (
            <View className="gap-3">
              <ListRow
                title="Transfer ownership"
                showChevron
                onPress={() =>
                  router.push("/(app)/settings/transfer-ownership")
                }
              />
              <Button
                title="Delete mess"
                variant="danger"
                leftIcon="delete-forever"
                onPress={handleDeleteMess}
              />
            </View>
          ) : (
            <Button
              title="Leave mess"
              variant="danger"
              leftIcon="logout"
              onPress={handleLeaveMess}
            />
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={300}>
        <Button
          title="Sign out"
          variant="danger"
          leftIcon="logout"
          onPress={handleLogout}
        />
      </FadeIn>
    </Screen>
  );
}
