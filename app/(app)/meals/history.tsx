import { Link, router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { MealEntry } from "@/lib/api/types";
import { useDeleteMealEntry, useMealsList } from "@/lib/queries/meals";
import { formatDisplayDate, formatShortDate, getMonthRange } from "@/lib/utils/dates";

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
    <Card>
      <Text className="mb-1 font-sans text-xs text-muted">
        {formatDisplayDate(entry.mealDate)}
      </Text>
      <Text className="font-sans text-base font-semibold text-foreground">
        {entry.member.fullName}
      </Text>
      <Text className="mt-1 font-sans text-sm text-muted">
        B: {entry.breakfast} · L: {entry.lunch} · D: {entry.dinner} · Total: {entry.total}
      </Text>
      {entry.note ? (
        <Text className="mt-1 font-sans text-sm italic text-muted">{entry.note}</Text>
      ) : null}

      {canEdit ? (
        <View className="mt-3 flex-row gap-4 border-t border-border pt-3">
          <Pressable onPress={() => onEdit(entry)} hitSlop={8}>
            <Text className="font-sans text-sm font-semibold text-primary">Edit</Text>
          </Pressable>
          <Pressable onPress={() => onDelete(entry)} hitSlop={8}>
            <Text className="font-sans text-sm font-semibold text-danger">Delete</Text>
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

  const historyQuery = useMealsList(from, to);
  const entries = historyQuery.data?.entries ?? [];

  const handleEdit = (entry: MealEntry) => {
    router.push({
      pathname: "/(app)/meals/[id]",
      params: { id: entry.id, date: entry.mealDate },
    });
  };

  const handleDelete = (entry: MealEntry) => {
    Alert.alert(
      "Delete meal entry",
      `Remove ${entry.member.fullName}'s meal on ${formatDisplayDate(entry.mealDate)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(entry.id, {
              onSuccess: () => {
                Toast.show({ type: "success", text1: "Meal entry deleted" });
              },
              onError: (err) => {
                Toast.show({
                  type: "error",
                  text1: "Delete failed",
                  text2: err instanceof ApiError ? err.message : "Something went wrong",
                });
              },
            });
          },
        },
      ],
    );
  };

  return (
    <Screen
      edges={[]}
      subtitle={`${formatShortDate(from)} – ${formatShortDate(to)}`}
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

      <View className="gap-3">
        {entries.map((entry) => (
          <MealHistoryCard
            key={entry.id}
            entry={entry}
            canEdit={isManagerOrAbove}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </View>

      {historyQuery.isSuccess && entries.length === 0 ? (
        <EmptyState
          title="No meal entries"
          description="No meal entries in this period."
        />
      ) : null}

      <Link href="/(app)/meals/summary" asChild>
        <Pressable className="mt-4">
          <Text className="font-sans text-base font-medium text-primary">
            View monthly summary →
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}
