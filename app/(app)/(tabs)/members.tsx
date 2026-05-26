import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { Member, MemberStatus } from "@/lib/api/types";
import { useMembers, useRemoveMember } from "@/lib/queries/members";

type StatusFilter = MemberStatus | "ALL";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "LEFT", label: "Left" },
  { value: "ALL", label: "All" },
];

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
            onPress={() => router.push("/(app)/members/add")}
          />
        ) : undefined
      }
    >
      <View style={styles.filters}>
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

      <View style={styles.list}>
        {members.map((member) => (
          <Card key={member.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{member.fullName}</Text>
                <Text style={styles.meta}>
                  {member.roleKey} · {member.status}
                  {member.roomNo ? ` · Room ${member.roomNo}` : ""}
                </Text>
                {member.phone ? (
                  <Text style={styles.meta}>{member.phone}</Text>
                ) : null}
                {member.email ? (
                  <Text style={styles.meta}>{member.email}</Text>
                ) : null}
                {member.joiningDate ? (
                  <Text style={styles.meta}>Joined {member.joiningDate}</Text>
                ) : null}
              </View>
            </View>

            {isManagerOrAbove ? (
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => router.push(`/(app)/members/${member.id}`)}
                >
                  <Text style={styles.editAction}>Edit</Text>
                </Pressable>
                {canManageMember(member) ? (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleRemove(member)}
                    disabled={removeMutation.isPending}
                  >
                    <Text style={styles.removeAction}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </Card>
        ))}
      </View>

      {membersQuery.isSuccess && members.length === 0 ? (
        <Text style={styles.empty}>
          No members match this filter.
          {isManagerOrAbove && statusFilter === "ACTIVE"
            ? " Add your first member."
            : ""}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 12,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  meta: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionBtn: {
    paddingVertical: 4,
  },
  editAction: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  removeAction: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 32,
  },
});
