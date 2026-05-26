import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
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

  const membersQuery = useMembers({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: search.trim() || undefined,
    limit: 50,
  });

  const handleRemove = (member: Member) => {
    Alert.alert("Remove member", `Remove ${member.fullName} from the mess?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeMutation.mutate(member.id, {
            onSuccess: () => {
              Toast.show({ type: "success", text1: "Member removed" });
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

  const members = membersQuery.data ?? [];

  return (
    <Screen
      title="Members"
      subtitle={`${members.length} shown`}
      refreshing={membersQuery.isRefetching}
      onRefresh={() => membersQuery.refetch()}
      footer={
        isManagerOrAbove ? (
          <Button
            title="Add member"
            size="lg"
            onPress={() => router.push("/(app)/members/add")}
          />
        ) : undefined
      }
    >
      <View className="mb-4 gap-3">
        <SegmentControl
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Input
          placeholder="Search by name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

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

      <View className="gap-3">
        {members.map((member) => (
          <Card key={member.id}>
            <View className="mb-2 flex-row flex-wrap items-center gap-2">
              <Text className="flex-1 font-sans text-base font-semibold text-foreground">
                {member.fullName}
              </Text>
              <Badge label={member.roleKey} variant={roleBadgeVariant(member.roleKey)} />
              <Badge label={member.status} variant={statusBadgeVariant(member.status)} />
            </View>

            {member.roomNo ? (
              <Text className="font-sans text-sm text-muted">Room {member.roomNo}</Text>
            ) : null}
            {member.phone ? (
              <Text className="font-sans text-sm text-muted">{member.phone}</Text>
            ) : null}
            {member.email ? (
              <Text className="font-sans text-sm text-muted">{member.email}</Text>
            ) : null}
            {member.joiningDate ? (
              <Text className="font-sans text-sm text-muted">
                Joined {formatShortDate(member.joiningDate)}
              </Text>
            ) : null}

            {isManagerOrAbove ? (
              <View className="mt-3 flex-row gap-4 border-t border-border pt-3">
                <Pressable
                  onPress={() => router.push(`/(app)/members/${member.id}`)}
                  hitSlop={8}
                >
                  <Text className="font-sans text-sm font-semibold text-primary">Edit</Text>
                </Pressable>
                {canManageMember(member) ? (
                  <Pressable
                    onPress={() => handleRemove(member)}
                    disabled={removeMutation.isPending}
                    hitSlop={8}
                  >
                    <Text className="font-sans text-sm font-semibold text-danger">
                      Remove
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </Card>
        ))}
      </View>

      {membersQuery.isSuccess && members.length === 0 ? (
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
  );
}
