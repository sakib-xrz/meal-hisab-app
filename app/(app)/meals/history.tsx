import { Link, router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { MealEntry } from "@/lib/api/types";
import { useDeleteMealEntry, useMealsList } from "@/lib/queries/meals";
import { getMonthRange } from "@/lib/utils/dates";

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
    <Card style={styles.card}>
      <Text style={styles.date}>{entry.mealDate}</Text>
      <Text style={styles.name}>{entry.member.fullName}</Text>
      <Text style={styles.counts}>
        B: {entry.breakfast} · L: {entry.lunch} · D: {entry.dinner} · Total: {entry.total}
      </Text>
      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}

      {canEdit ? (
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={() => onEdit(entry)}>
            <Text style={styles.editAction}>Edit</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => onDelete(entry)}>
            <Text style={styles.deleteAction}>Delete</Text>
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
      `Remove ${entry.member.fullName}'s meal on ${entry.mealDate}?`,
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
      title="Meal history"
      subtitle={`${from} to ${to}`}
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

      <View style={styles.list}>
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
        <Text style={styles.empty}>No meal entries in this period.</Text>
      ) : null}

      <Link href="/(app)/meals/summary" style={styles.link}>
        View monthly summary
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { marginBottom: 0 },
  date: { fontSize: 12, color: "#6b7280", marginBottom: 2 },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  counts: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  note: { fontSize: 13, color: "#9ca3af", marginTop: 4, fontStyle: "italic" },
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
  deleteAction: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  empty: { color: "#6b7280", textAlign: "center", paddingVertical: 32 },
  link: { color: "#2563eb", marginTop: 16, fontWeight: "500" },
});
