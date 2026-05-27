import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { ConfirmSheet, useBottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { FadeIn, StaggerList } from "@/components/ui/animated-view";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import { useMembers } from "@/lib/queries/members";
import { useTransferOwnership } from "@/lib/queries/mess";

export default function TransferOwnershipScreen() {
  const { isOwner, refreshUser } = useAuth();
  const [transferTarget, setTransferTarget] = useState<{ id: string; fullName: string } | null>(null);
  const transferSheet = useBottomSheetModal();

  const membersQuery = useMembers({ status: "ACTIVE", limit: 50 });
  const transferMutation = useTransferOwnership();

  const handleSelectCandidate = (memberId: string, fullName: string) => {
    setTransferTarget({ id: memberId, fullName });
    transferSheet.open();
  };

  const handleConfirmTransfer = () => {
    if (!transferTarget) return;
    transferMutation.mutate(transferTarget.id, {
      onSuccess: async () => {
        await refreshUser();
        Toast.show({ type: "success", text1: "Ownership transferred" });
        transferSheet.close();
        setTransferTarget(null);
        router.back();
      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Transfer failed",
          text2:
            err instanceof ApiError
              ? err.message
              : "Something went wrong",
        });
      },
    });
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
    <>
      <Screen
      edges={[]}
      subtitle="Select a member with a linked app account"
      refreshing={membersQuery.isRefetching}
      onRefresh={() => membersQuery.refetch()}
    >
      <FadeIn delay={50}>
        <Card variant="glass" className="mb-5 border-accent-soft/75 bg-accent-soft/40">
          <Text className="font-sans text-sm font-medium leading-5 text-amber-900">
            Transferring ownership is permanent. You will become a manager and
            lose owner-only actions like deleting the mess.
          </Text>
        </Card>
      </FadeIn>

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

      {candidates.length > 0 ? (
        <View className="gap-3.5">
          <StaggerList staggerMs={40}>
            {candidates.map((member) => (
              <Card variant="glass" key={member.id} className="p-0.5">
                <Pressable
                  onPress={() => handleSelectCandidate(member.id, member.fullName)}
                  disabled={transferMutation.isPending}
                  className="flex-row items-center p-3.5 active:opacity-80"
                >
                  <Avatar name={member.fullName} size="sm" className="mr-3" />
                  <View className="flex-1">
                    <View className="mb-1 flex-row items-center gap-2">
                      <Text
                        className="flex-1 font-sans text-base font-semibold text-foreground"
                        numberOfLines={1}
                      >
                        {member.fullName}
                      </Text>
                      <Badge label={member.roleKey} variant="primary" />
                    </View>
                    <Text className="font-sans text-sm text-muted">
                      {member.phone ?? "No phone linked"}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color="#64706d" />
                </Pressable>
              </Card>
            ))}
          </StaggerList>
        </View>
      ) : membersQuery.isSuccess && candidates.length === 0 ? (
        <EmptyState
          title="No candidates"
          description="Add a member with a registered phone first."
        />
      ) : null}

    </Screen>
      <ConfirmSheet
        sheetRef={transferSheet.ref}
        title="Transfer ownership"
        description={
          transferTarget
            ? `Make ${transferTarget.fullName} the new owner? You will become a manager and lose owner privileges.`
            : "Transfer mess ownership?"
        }
        confirmLabel="Transfer"
        variant="danger"
        loading={transferMutation.isPending}
        onConfirm={handleConfirmTransfer}
      />
    </>
  );
}
