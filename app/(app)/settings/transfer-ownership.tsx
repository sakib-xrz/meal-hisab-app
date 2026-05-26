import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import { useMembers } from "@/lib/queries/members";
import { useTransferOwnership } from "@/lib/queries/mess";

export default function TransferOwnershipScreen() {
  const { isOwner, refreshUser } = useAuth();

  const membersQuery = useMembers({ status: "ACTIVE", limit: 50 });
  const transferMutation = useTransferOwnership();

  const confirmTransfer = (memberId: string, fullName: string) => {
    Alert.alert(
      "Transfer ownership",
      `Make ${fullName} the new owner? You will become a manager.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          onPress: () => {
            transferMutation.mutate(memberId, {
              onSuccess: async () => {
                await refreshUser();
                Toast.show({ type: "success", text1: "Ownership transferred" });
                router.back();
              },
              onError: (err) => {
                Toast.show({
                  type: "error",
                  text1: "Transfer failed",
                  text2: err instanceof ApiError ? err.message : "Something went wrong",
                });
              },
            });
          },
        },
      ],
    );
  };

  if (!isOwner) {
    return (
      <Screen title="Transfer ownership">
        <Text style={styles.empty}>Only the mess owner can transfer ownership.</Text>
      </Screen>
    );
  }

  const candidates =
    membersQuery.data?.filter((m) => m.roleKey !== "OWNER") ?? [];

  return (
    <Screen
      title="Transfer ownership"
      subtitle="Select a member with a linked app account"
      refreshing={membersQuery.isRefetching}
      onRefresh={() => membersQuery.refetch()}
    >
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
        {candidates.map((member) => (
          <Card key={member.id} style={styles.card}>
            <Pressable
              onPress={() => confirmTransfer(member.id, member.fullName)}
              disabled={transferMutation.isPending}
            >
              <Text style={styles.name}>{member.fullName}</Text>
              <Text style={styles.meta}>
                {member.roleKey}
                {member.phone ? ` · ${member.phone}` : ""}
              </Text>
            </Pressable>
          </Card>
        ))}
      </View>

      {membersQuery.isSuccess && candidates.length === 0 ? (
        <Text style={styles.empty}>
          No other members available. Add a member with a registered phone first.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { marginBottom: 0 },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  empty: { color: "#6b7280", textAlign: "center", paddingVertical: 32 },
});
