import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
import { FadeIn, StaggerList } from "@/components/ui/animated-view";
import { ApiError } from "@/lib/api/client";
import type { RoleKey } from "@/lib/api/types";
import { useAddMember } from "@/lib/queries/members";

const schema = z
  .object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    roomNo: z.string().optional(),
    joiningDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    roleKey: z.enum(["MEMBER", "MANAGER"]),
  })
  .refine(
    (d) =>
      (d.fullName?.trim()?.length ?? 0) >= 2 ||
      (d.phone?.trim()?.length ?? 0) >= 10,
    {
      message: "Provide full name (2+ chars) or a registered user's phone",
      path: ["phone"],
    },
  );

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: { value: RoleKey; label: string }[] = [
  { value: "MEMBER", label: "Member" },
  { value: "MANAGER", label: "Manager" },
];

export default function AddMemberScreen() {
  const addMutation = useAddMember();
  const {
    control,
    handleSubmit,
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
      joiningDate: "",
      roleKey: "MEMBER",
    },
  });

  const roleKey = watch("roleKey");

  const onSubmit = async (values: FormValues) => {
    addMutation.mutate(
      {
        fullName: values.fullName?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        roomNo: values.roomNo?.trim() || undefined,
        joiningDate: values.joiningDate?.trim() || undefined,
        roleKey: values.roleKey,
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Member added" });
          router.back();
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Could not add member",
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  return (
    <Screen edges={[]} keyboardAvoid>
      <Text className="mb-4 font-sans text-sm leading-5 text-muted">
        Add by phone to link a registered user, or enter a full name for a
        manual profile. Managers can assign roles; owners cannot be created
        here.
      </Text>

      <Card variant="glass">
        <StaggerList staggerMs={40} className="mb-4.5">
          <View>
            <Label>Full name</Label>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Rahim Uddin"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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
                  placeholder="017XXXXXXXX (links registered user)"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
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
                  placeholder="Optional"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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
                  placeholder="Optional"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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
                  placeholder="YYYY-MM-DD (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.joiningDate?.message}
                />
              )}
            />
          </View>

          <View>
            <Label>Role</Label>
            <SegmentControl
              options={ROLE_OPTIONS}
              value={roleKey}
              onChange={(v) => setValue("roleKey", v as "MEMBER" | "MANAGER")}
            />
          </View>

          <Button
            title="Add member"
            leftIcon="person-add-alt-1"
            loading={addMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            className="mt-2"
          />
        </StaggerList>
      </Card>
    </Screen>
  );
}
