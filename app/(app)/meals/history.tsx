import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { ActionRow } from "@/components/ui/action-row";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { ConfirmSheet, useBottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { ShimmerCard } from "@/components/ui/shimmer";
import { FadeIn, StaggerList } from "@/components/ui/animated-view";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { MealEntry } from "@/lib/api/types";
import { useDeleteMealEntry, useMealsList } from "@/lib/queries/meals";
import {
  formatDisplayDate,
  formatShortDate,
  getMonthRange,
} from "@/lib/utils/dates";

function MealHistoryCard({
  entry,
  canEdit,
  onEdit,
  onDelete,
}: {
  entry: MealEntry;
  canEdit: boolean;
  onEdit: (entry: MealEntry) => void;
  onDelete: (entry: MealEntry) => void;
}) {
  return (
    <Card variant="glass">
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="mb-1 font-sans text-xs text-muted">
            {formatDisplayDate(entry.mealDate)}
          </Text>
          <Text className="font-sans text-base font-semibold text-foreground">
            {entry.member.fullName}
          </Text>
        </View>
        <Badge label={`${entry.total} total`} variant="primary" />
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Badge label={`B ${entry.breakfast}`} variant="muted" />
        <Badge label={`L ${entry.lunch}`} variant="accent" />
        <Badge label={`D ${entry.dinner}`} variant="default" />
      </View>
      {entry.note ? (
        <Text className="mt-1 font-sans text-sm italic text-muted">
          {entry.note}
        </Text>
      ) : null}

      {canEdit ? (
        <View className="mt-3 flex-row gap-2 border-t border-border pt-3">
          <Pressable
            onPress={() => onEdit(entry)}
            hitSlop={8}
            className="h-9 flex-row items-center rounded-md bg-primary-soft px-3 active:opacity-80"
            accessibilityRole="button"
          >
            <MaterialIcons name="edit" size={16} color="#0b4f4a" />
            <Text className="ml-1.5 font-sans text-sm font-semibold text-primary-dark">
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(entry)}
            hitSlop={8}
            className="h-9 flex-row items-center rounded-md bg-danger-soft px-3 active:opacity-80"
            accessibilityRole="button"
          >
            <MaterialIcons name="delete-outline" size={17} color="#d9385e" />
            <Text className="ml-1.5 font-sans text-sm font-semibold text-danger">
              Delete
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

export default function MealHistoryScreen() {
  const { isManagerOrAbove } = useAuth();
  const { from, to } = getMonthRange();
  const deleteMutation = useDeleteMealEntry();
  const [deleteTarget, setDeleteTarget] = useState<MealEntry | null>(null);
  const deleteSheet = useBottomSheetModal();

  const historyQuery = useMealsList(from, to);
  const entries = historyQuery.data?.entries ?? [];

  const handleEdit = (entry: MealEntry) => {
    router.push({
      pathname: "/(app)/meals/[id]",
      params: { id: entry.id, date: entry.mealDate },
    });
  };

  const handleDelete = (entry: MealEntry) => {
    setDeleteTarget(entry);
    deleteSheet.open();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Meal entry deleted" });
        deleteSheet.close();
        setDeleteTarget(null);
      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2: err instanceof ApiError ? err.message : "Something went wrong",
        });
      },
    });
  };

  const showSkeleton =
    historyQuery.isLoading || (historyQuery.isFetching && entries.length === 0);

  return (
    <>
      <Screen
      edges={[]}
      subtitle={`${formatShortDate(from)} - ${formatShortDate(to)}`}
      refreshing={historyQuery.isRefetching}
      onRefresh={() => historyQuery.refetch()}
    >
      {historyQuery.error ? (
        <ErrorState
          message={
            historyQuery.error instanceof Error
              ? historyQuery.error.message
              : "Failed to load"
          }
          onRetry={() => historyQuery.refetch()}
        />
      ) : null}

      {showSkeleton ? (
        <View className="gap-3">
          <ShimmerCard />
          <ShimmerCard />
          <ShimmerCard />
        </View>
      ) : entries.length > 0 ? (
        <View className="gap-3.5">
          <StaggerList staggerMs={40}>
            {entries.map((entry) => (
              <MealHistoryCard
                key={entry.id}
                entry={entry}
                canEdit={isManagerOrAbove}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </StaggerList>
        </View>
      ) : historyQuery.isSuccess && entries.length === 0 ? (
        <EmptyState
          title="No meal entries"
          description="No meal entries in this period."
        />
      ) : null}

      <Link href="/(app)/meals/summary" asChild>
        <ActionRow
          className="mt-4"
          title="View monthly summary"
          subtitle="Totals by member and date"
          icon="analytics"
          tone="accent"
        />
      </Link>

    </Screen>
      <ConfirmSheet
        sheetRef={deleteSheet.ref}
        title="Delete meal entry"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.member.fullName}'s meal on ${formatDisplayDate(deleteTarget.mealDate)}?`
            : "Remove this meal entry?"
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
