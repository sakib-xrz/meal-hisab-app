import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button, Label } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen, Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
import { ApiError } from "@/lib/api/client";
import type { MemberStatus, RoleKey } from "@/lib/api/types";
import { useMembers, useRemoveMember, useUpdateMember } from "@/lib/queries/members";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  roomNo: z.string().optional(),
  roleKey: z.enum(["MEMBER", "MANAGER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  joiningDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  leavingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: { value: RoleKey; label: string }[] = [
  { value: "MEMBER", label: "Member" },
  { value: "MANAGER", label: "Manager" },
];

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function EditMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const updateMutation = useUpdateMember();
  const removeMutation = useRemoveMember();

  const membersQuery = useMembers({ limit: 50 });
  const member = membersQuery.data?.find((m) => m.id === id);
  const isLeft = member?.status === "LEFT";
  const isOwner = member?.roleKey === "OWNER";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      roomNo: "",
      roleKey: "MEMBER",
      status: "ACTIVE",
      joiningDate: "",
      leavingDate: "",
    },
  });

  const roleKey = watch("roleKey");
  const status = watch("status");

  useEffect(() => {
    if (!member) return;
    reset({
      fullName: member.fullName,
      phone: member.phone ?? "",
      email: member.email ?? "",
      roomNo: member.roomNo ?? "",
      roleKey: member.roleKey === "OWNER" ? "MANAGER" : member.roleKey,
      status: member.status === "LEFT" ? "INACTIVE" : member.status,
      joiningDate: member.joiningDate ?? "",
      leavingDate: member.leavingDate ?? "",
    });
  }, [member, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!id || !member || isLeft) return;

    updateMutation.mutate(
      {
        memberId: id,
        input: {
          fullName: values.fullName,
          phone: values.phone?.trim() || null,
          email: values.email?.trim() || null,
          roomNo: values.roomNo?.trim() || null,
          ...(isOwner ? {} : { roleKey: values.roleKey }),
          ...(isOwner ? {} : { status: values.status }),
          joiningDate: values.joiningDate?.trim() || null,
          leavingDate: values.leavingDate?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Member updated" });
          router.back();
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

  const handleRemove = () => {
    if (!id || !member) return;
    Alert.alert("Remove member", `Remove ${member.fullName} from the mess?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeMutation.mutate(id, {
            onSuccess: () => {
              Toast.show({ type: "success", text1: "Member removed" });
              router.back();
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

  if (membersQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!member) {
    return (
      <Screen title="Edit member">
        <Text className="text-gray-500 text-center py-8">Member not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Edit member"
      subtitle={isLeft ? "This member has left" : undefined}
      keyboardAvoid
      footer={
        !isLeft && !isOwner ? (
          <Button title="Remove member" variant="danger" onPress={handleRemove} />
        ) : undefined
      }
    >
      <View className="gap-4 mt-2">
        <View>
          <Label>Full name *</Label>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
                error={errors.fullName?.message}
              />
            )}
          />
        </View>

        <View>
          <Label>Phone</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
              />
            )}
          />
        </View>

        <View>
          <Label>Email</Label>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
                error={errors.email?.message}
              />
            )}
          />
        </View>

        <View>
          <Label>Room no</Label>
          <Controller
            control={control}
            name="roomNo"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
              />
            )}
          />
        </View>

        <View>
          <Label>Joining date</Label>
          <Controller
            control={control}
            name="joiningDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
                error={errors.joiningDate?.message}
              />
            )}
          />
        </View>

        <View>
          <Label>Leaving date</Label>
          <Controller
            control={control}
            name="leavingDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLeft}
                error={errors.leavingDate?.message}
              />
            )}
          />
        </View>

        {isOwner ? (
          <Text className="text-gray-500 text-sm">
            Owner — role and status cannot be changed here. Use transfer ownership first.
          </Text>
        ) : (
          <>
            <View>
              <Label>Role</Label>
              <SegmentControl
                options={ROLE_OPTIONS}
                value={roleKey}
                onChange={(v) => setValue("roleKey", v as "MEMBER" | "MANAGER")}
                disabled={isLeft}
              />
            </View>

            <View>
              <Label>Status</Label>
              <SegmentControl
                options={STATUS_OPTIONS}
                value={status}
                onChange={(v) => setValue("status", v as "ACTIVE" | "INACTIVE")}
                disabled={isLeft}
              />
            </View>
          </>
        )}

        {!isLeft ? (
          <Button
            title="Save changes"
            loading={updateMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        ) : null}
      </View>
    </Screen>
  );
}
