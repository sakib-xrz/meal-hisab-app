import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
      <Screen edges={[]}>
        <EmptyState
          title="Access denied"
          description="Only the mess owner can transfer ownership."
        />
      </Screen>
    );
  }

  const candidates =
    membersQuery.data?.filter((m) => m.roleKey !== "OWNER") ?? [];

  return (
    <Screen
      edges={[]}
      subtitle="Select a member with a linked app account"
      refreshing={membersQuery.isRefetching}
      onRefresh={() => membersQuery.refetch()}
    >
      <Card className="mb-4 border-accent bg-accent-soft/40">
        <Text className="font-sans text-sm leading-5 text-amber-900">
          Transferring ownership is permanent. You will become a manager and lose owner-only
          actions like deleting the mess.
        </Text>
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

      <View className="gap-3">
        {candidates.map((member) => (
          <Card key={member.id}>
            <Pressable
              onPress={() => confirmTransfer(member.id, member.fullName)}
              disabled={transferMutation.isPending}
              className="active:opacity-80"
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-sans text-base font-semibold text-foreground">
                  {member.fullName}
                </Text>
                <Badge label={member.roleKey} variant="primary" />
              </View>
              <Text className="font-sans text-sm text-muted">
                {member.phone ?? "No phone linked"}
              </Text>
            </Pressable>
          </Card>
        ))}
      </View>

      {membersQuery.isSuccess && candidates.length === 0 ? (
        <EmptyState
          title="No candidates"
          description="Add a member with a registered phone first."
        />
      ) : null}
    </Screen>
  );
}
