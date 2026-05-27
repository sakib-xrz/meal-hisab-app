import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { StaggerList } from "@/components/ui/animated-view";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmSheet,
  useBottomSheetModal,
} from "@/components/ui/bottom-sheet-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
import { ShimmerRow } from "@/components/ui/shimmer";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { Member, MemberStatus, RoleKey } from "@/lib/api/types";
import { useMembers, useRemoveMember } from "@/lib/queries/members";
import { formatShortDate } from "@/lib/utils/dates";

type StatusFilter = MemberStatus | "ALL";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LEFT", label: "Left" },
  { value: "ALL", label: "All" },
];

function roleBadgeVariant(role: RoleKey) {
  if (role === "OWNER") return "accent" as const;
  if (role === "MANAGER") return "primary" as const;
  return "muted" as const;
}

function statusBadgeVariant(status: MemberStatus) {
  if (status === "ACTIVE") return "primary" as const;
  if (status === "LEFT") return "danger" as const;
  return "muted" as const;
}

function canManageMember(member: Member) {
  return member.status === "ACTIVE" && member.roleKey !== "OWNER";
}

export default function MembersScreen() {
  const { isManagerOrAbove } = useAuth();
  const removeMutation = useRemoveMember();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);

  const removeSheet = useBottomSheetModal();

  const membersQuery = useMembers({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search.trim() || undefined,
    limit: 50,
  });

  const handleRemove = (member: Member) => {
    setRemoveTarget(member);
    removeSheet.open();
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.id, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Member removed" });
        removeSheet.close();
        setRemoveTarget(null);
      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Remove failed",
          text2: err instanceof ApiError ? err.message : "Something went wrong",
        });
      },
    });
  };

  const members = membersQuery.data ?? [];
  const showSkeleton =
    membersQuery.isLoading || (membersQuery.isFetching && members.length === 0);

  return (
    <>
      <Screen
        title="Members"
        subtitle={`${members.length} member${members.length === 1 ? "" : "s"}`}
        refreshing={membersQuery.isRefetching}
        onRefresh={() => membersQuery.refetch()}
        contentClassName="pt-2"
        footer={
          isManagerOrAbove ? (
            <Button
              title="Add member"
              leftIcon="person-add-alt-1"
              size="lg"
              onPress={() => router.push("/(app)/members/add")}
              className="mb-16"
            />
          ) : undefined
        }
      >
        {/* Search & Filters Glass Card */}
        <Card variant="glass" className="mb-5 gap-3.5 p-3.5 shadow-sm">
          <SegmentControl
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            variant="glass"
            size="sm"
          />
          <Input
            placeholder="Search by name"
            value={search}
            onChangeText={setSearch}
            leftIcon="search"
          />
        </Card>

        {membersQuery.error ? (
          <ErrorState
            message={
              membersQuery.error instanceof Error
                ? membersQuery.error.message
                : "Failed to load"
            }
            onRetry={() => membersQuery.refetch()}
          />
        ) : null}

        {showSkeleton ? (
          <View className="gap-3">
            <ShimmerRow />
            <ShimmerRow />
            <ShimmerRow />
          </View>
        ) : members.length > 0 ? (
          <View className="gap-3.5">
            <StaggerList staggerMs={40}>
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="p-4 shadow-sm border border-border/40"
                >
                  <View className="mb-3 flex-row items-center">
                    <Avatar name={member.fullName} size="sm" className="mr-3" />
                    <View className="flex-1">
                      <Text
                        className="font-sans text-base font-semibold text-foreground"
                        numberOfLines={1}
                      >
                        {member.fullName}
                      </Text>
                      <View className="mt-1 flex-row flex-wrap gap-2">
                        <Badge
                          label={member.roleKey}
                          variant={roleBadgeVariant(member.roleKey)}
                          pill
                        />
                        <Badge
                          label={member.status}
                          variant={statusBadgeVariant(member.status)}
                          pill
                        />
                      </View>
                    </View>
                  </View>

                  <View className="gap-1 mt-1 pl-1">
                    {member.roomNo ? (
                      <Text className="font-sans text-sm text-muted">
                        <MaterialIcons name="room" size={13} color="#8b9894" />{" "}
                        Room {member.roomNo}
                      </Text>
                    ) : null}
                    {member.phone ? (
                      <Text className="font-sans text-sm text-muted">
                        <MaterialIcons name="phone" size={13} color="#8b9894" />{" "}
                        {member.phone}
                      </Text>
                    ) : null}
                    {member.email ? (
                      <Text className="font-sans text-sm text-muted">
                        <MaterialIcons name="email" size={13} color="#8b9894" />{" "}
                        {member.email}
                      </Text>
                    ) : null}
                    {member.joiningDate ? (
                      <Text className="font-sans text-sm text-muted">
                        <MaterialIcons
                          name="date-range"
                          size={13}
                          color="#8b9894"
                        />{" "}
                        Joined {formatShortDate(member.joiningDate)}
                      </Text>
                    ) : null}
                  </View>

                  {isManagerOrAbove ? (
                    <View className="mt-4 flex-row gap-3 border-t border-border/50 pt-3">
                      <Pressable
                        onPress={() =>
                          router.push(`/(app)/members/${member.id}`)
                        }
                        hitSlop={8}
                        className="h-9 flex-1 flex-row items-center justify-center rounded-xl bg-primary-soft/80 active:scale-95 active:opacity-85"
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${member.fullName}`}
                      >
                        <MaterialIcons name="edit" size={16} color="#0b4f4a" />
                        <Text className="ml-1.5 font-sans text-sm font-semibold text-primary-dark">
                          Edit
                        </Text>
                      </Pressable>
                      {canManageMember(member) ? (
                        <Pressable
                          onPress={() => handleRemove(member)}
                          disabled={removeMutation.isPending}
                          hitSlop={8}
                          className="h-9 flex-1 flex-row items-center justify-center rounded-xl bg-danger-soft/80 active:scale-95 active:opacity-85 disabled:opacity-50"
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${member.fullName}`}
                        >
                          <MaterialIcons
                            name="person-remove"
                            size={16}
                            color="#d9385e"
                          />
                          <Text className="ml-1.5 font-sans text-sm font-semibold text-danger">
                            Remove
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </Card>
              ))}
            </StaggerList>
          </View>
        ) : membersQuery.isSuccess && members.length === 0 ? (
          <EmptyState
            title="No members found"
            description={
              isManagerOrAbove && statusFilter === "ACTIVE"
                ? "Add your first member to get started."
                : "No members match this filter."
            }
            actionLabel={isManagerOrAbove ? "Add member" : undefined}
            onAction={
              isManagerOrAbove
                ? () => router.push("/(app)/members/add")
                : undefined
            }
          />
        ) : null}
      </Screen>
      <ConfirmSheet
        sheetRef={removeSheet.ref}
        title="Remove member"
        description={
          removeTarget
            ? `Remove ${removeTarget.fullName} from the mess?`
            : "Remove this member?"
        }
        confirmLabel="Remove"
        variant="danger"
        loading={removeMutation.isPending}
        onConfirm={confirmRemove}
      />
    </>
  );
}
