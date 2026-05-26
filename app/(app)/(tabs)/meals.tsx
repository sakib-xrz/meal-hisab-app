import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MealStepper } from "@/components/ui/meal-stepper";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { MealMemberRow } from "@/lib/api/types";
import {
  useDailyMealSheet,
  useDeleteMealEntry,
  useSaveDailyMealSheet,
} from "@/lib/queries/meals";
import {
  formatDisplayDate,
  isSameApiDate,
  shiftDate,
  todayApiDate,
} from "@/lib/utils/dates";

function MealRow({
  row,
  onChange,
  onEdit,
  onDelete,
  readOnly,
}: {
  row: MealMemberRow;
  onChange: (field: "breakfast" | "lunch" | "dinner", value: number) => void;
  onEdit: (mealEntryId: string) => void;
  onDelete: (mealEntryId: string, name: string) => void;
  readOnly?: boolean;
}) {
  const hasEntry = Boolean(row.mealEntryId);
  const hasMeals = row.breakfast > 0 || row.lunch > 0 || row.dinner > 0;

  return (
    <View className="border-b border-border py-4 last:border-b-0">
      <View className="mb-3 flex-row items-start justify-between">
        <Text className="flex-1 font-sans text-base font-semibold text-foreground">
          {row.fullName}
          {row.roomNo ? (
            <Text className="font-normal text-muted"> · {row.roomNo}</Text>
          ) : null}
        </Text>
        {!readOnly && hasEntry ? (
          <View className="flex-row gap-3">
            <Pressable onPress={() => onEdit(row.mealEntryId!)} hitSlop={8}>
              <Text className="font-sans text-sm font-semibold text-primary">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(row.mealEntryId!, row.fullName)}
              hitSlop={8}
            >
              <Text className="font-sans text-sm font-semibold text-danger">Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View className="flex-row justify-between px-2">
        <MealStepper
          label="Breakfast"
          value={row.breakfast}
          onChange={(v) => onChange("breakfast", v)}
          disabled={readOnly}
        />
        <MealStepper
          label="Lunch"
          value={row.lunch}
          onChange={(v) => onChange("lunch", v)}
          disabled={readOnly}
        />
        <MealStepper
          label="Dinner"
          value={row.dinner}
          onChange={(v) => onChange("dinner", v)}
          disabled={readOnly}
        />
      </View>

      {row.note ? (
        <Text className="mt-2 font-sans text-sm italic text-muted">{row.note}</Text>
      ) : null}
      {!readOnly && hasEntry && !hasMeals ? (
        <Text className="mt-2 font-sans text-xs text-muted">
          All zeros will remove this entry on save
        </Text>
      ) : null}
    </View>
  );
}

export default function MealsScreen() {
  const { isManagerOrAbove } = useAuth();
  const [date, setDate] = useState(todayApiDate());
  const [rows, setRows] = useState<MealMemberRow[]>([]);
  const [dirty, setDirty] = useState(false);

  const sheetQuery = useDailyMealSheet(date);
  const deleteMutation = useDeleteMealEntry();
  const sheetReady = sheetQuery.data ? isSameApiDate(sheetQuery.data.date, date) : false;

  useEffect(() => {
    setRows([]);
    setDirty(false);
  }, [date]);

  useEffect(() => {
    if (!sheetReady || !sheetQuery.data) return;
    setRows(sheetQuery.data.members);
    setDirty(false);
  }, [sheetQuery.data, sheetReady]);

  const saveMutation = useSaveDailyMealSheet(date);

  const handleSave = () => {
    saveMutation.mutate(
      {
        date,
        entries: rows.map((r) => ({
          memberId: r.memberId,
          breakfast: r.breakfast,
          lunch: r.lunch,
          dinner: r.dinner,
          note: r.note ?? undefined,
        })),
      },
      {
        onSuccess: () => {
          setDirty(false);
          Toast.show({ type: "success", text1: "Meals saved" });
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Save failed",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const updateRow = useCallback(
    (memberId: string, field: "breakfast" | "lunch" | "dinner", value: number) => {
      setRows((prev) =>
        prev.map((r) => (r.memberId === memberId ? { ...r, [field]: value } : r)),
      );
      setDirty(true);
    },
    [],
  );

  const handleEditEntry = (mealEntryId: string) => {
    router.push({
      pathname: "/(app)/meals/[id]",
      params: { id: mealEntryId, date },
    });
  };

  const handleDeleteEntry = (mealEntryId: string, name: string) => {
    Alert.alert("Delete meal entry", `Remove ${name}'s meal for this day?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(mealEntryId, {
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
    ]);
  };

  const summary = sheetReady ? sheetQuery.data?.summary : undefined;

  return (
    <Screen
      title="Daily meals"
      subtitle={formatDisplayDate(date)}
      refreshing={sheetQuery.isRefetching}
      onRefresh={() => sheetQuery.refetch()}
      footer={
        isManagerOrAbove ? (
          <Button
            title="Save sheet"
            size="lg"
            loading={saveMutation.isPending}
            disabled={!dirty}
            onPress={handleSave}
          />
        ) : undefined
      }
    >
      <Card className="mb-4 flex-row items-center justify-between p-3">
        <Button
          title="← Prev"
          variant="secondary"
          className="px-3 py-2"
          onPress={() => setDate((d) => shiftDate(d, -1))}
        />
        <Pressable onPress={() => setDate(todayApiDate())} hitSlop={8}>
          <Text className="font-sans text-sm font-semibold text-primary">Today</Text>
        </Pressable>
        <Button
          title="Next →"
          variant="secondary"
          className="px-3 py-2"
          onPress={() => setDate((d) => shiftDate(d, 1))}
        />
      </Card>

      {sheetQuery.error ? (
        <ErrorState
          message={
            sheetQuery.error instanceof Error
              ? sheetQuery.error.message
              : "Failed to load"
          }
          onRetry={() => sheetQuery.refetch()}
        />
      ) : null}

      {rows.length > 0 ? (
        <Card className="mb-4">
          {rows.map((row) => (
            <MealRow
              key={row.memberId}
              row={row}
              readOnly={!isManagerOrAbove}
              onChange={(field, value) => updateRow(row.memberId, field, value)}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </Card>
      ) : sheetQuery.isSuccess && sheetReady ? (
        <EmptyState
          title="No members on this sheet"
          description="Add active members to start tracking meals."
        />
      ) : sheetQuery.isLoading || sheetQuery.isFetching ? (
        <Text className="py-8 text-center font-sans text-muted">Loading meals…</Text>
      ) : null}

      {summary ? (
        <Card title="Day total" className="mb-4">
          <Text className="font-sans text-base text-muted">
            B: {summary.breakfast} · L: {summary.lunch} · D: {summary.dinner} · Total:{" "}
            {summary.total}
          </Text>
        </Card>
      ) : null}

      <View className="gap-2">
        <Link href="/(app)/meals/history" asChild>
          <Pressable>
            <Text className="font-sans text-base font-medium text-primary">
              View all meal history →
            </Text>
          </Pressable>
        </Link>
        <Link href="/(app)/meals/summary" asChild>
          <Pressable>
            <Text className="font-sans text-base font-medium text-primary">
              Monthly summary →
            </Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
