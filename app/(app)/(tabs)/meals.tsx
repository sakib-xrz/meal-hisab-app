import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
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
  shiftDate,
  todayApiDate,
} from "@/lib/utils/dates";

const MEAL_OPTIONS = [0, 0.5, 1] as const;

function toMealStepValue(value: number): (typeof MEAL_OPTIONS)[number] {
  const n = Number(value);
  if (n === 0 || n === 0.5 || n === 1) return n;
  return 0;
}

function MealStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const cycle = () => {
    const current = toMealStepValue(value);
    const idx = MEAL_OPTIONS.indexOf(current);
    const next = MEAL_OPTIONS[(idx + 1) % MEAL_OPTIONS.length];
    onChange(next);
  };

  return (
    <Pressable
      onPress={disabled ? undefined : cycle}
      style={[styles.stepper, disabled && styles.stepperDisabled]}
    >
      <Text style={styles.stepperValue}>{toMealStepValue(value)}</Text>
    </Pressable>
  );
}

function MealRow({
  row,
  date,
  onChange,
  onEdit,
  onDelete,
  readOnly,
}: {
  row: MealMemberRow;
  date: string;
  onChange: (field: "breakfast" | "lunch" | "dinner", value: number) => void;
  onEdit: (mealEntryId: string) => void;
  onDelete: (mealEntryId: string, name: string) => void;
  readOnly?: boolean;
}) {
  const hasEntry = Boolean(row.mealEntryId);
  const hasMeals = row.breakfast > 0 || row.lunch > 0 || row.dinner > 0;

  return (
    <View style={styles.mealRow}>
      <View style={styles.mealHeader}>
        <Text style={styles.memberName}>
          {row.fullName}
          {row.roomNo ? <Text style={styles.roomNo}> · {row.roomNo}</Text> : null}
        </Text>
        {!readOnly && hasEntry ? (
          <View style={styles.rowActions}>
            <Pressable onPress={() => onEdit(row.mealEntryId!)} hitSlop={8}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => onDelete(row.mealEntryId!, row.fullName)}
              hitSlop={8}
            >
              <Text style={styles.deleteLink}>Delete</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.stepperRow}>
        <View style={styles.stepperCol}>
          <Text style={styles.stepperLabel}>B</Text>
          <MealStepper
            value={row.breakfast}
            onChange={(v) => onChange("breakfast", v)}
            disabled={readOnly}
          />
        </View>
        <View style={styles.stepperCol}>
          <Text style={styles.stepperLabel}>L</Text>
          <MealStepper
            value={row.lunch}
            onChange={(v) => onChange("lunch", v)}
            disabled={readOnly}
          />
        </View>
        <View style={styles.stepperCol}>
          <Text style={styles.stepperLabel}>D</Text>
          <MealStepper
            value={row.dinner}
            onChange={(v) => onChange("dinner", v)}
            disabled={readOnly}
          />
        </View>
      </View>

      {row.note ? <Text style={styles.note}>{row.note}</Text> : null}
      {!readOnly && hasEntry && !hasMeals ? (
        <Text style={styles.hint}>All zeros will remove this entry on save</Text>
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
  const sheetReady = sheetQuery.data?.date === date;

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
            loading={saveMutation.isPending}
            disabled={!dirty}
            onPress={handleSave}
          />
        ) : undefined
      }
    >
      <View style={styles.dateNav}>
        <Button
          title="← Prev"
          variant="secondary"
          onPress={() => setDate((d) => shiftDate(d, -1))}
          style={styles.navBtn}
        />
        <Pressable onPress={() => setDate(todayApiDate())}>
          <Text style={styles.todayLink}>Today</Text>
        </Pressable>
        <Button
          title="Next →"
          variant="secondary"
          onPress={() => setDate((d) => shiftDate(d, 1))}
          style={styles.navBtn}
        />
      </View>

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
        <Card>
          {rows.map((row) => (
            <MealRow
              key={row.memberId}
              row={row}
              date={date}
              readOnly={!isManagerOrAbove}
              onChange={(field, value) => updateRow(row.memberId, field, value)}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </Card>
      ) : sheetQuery.isSuccess && sheetReady ? (
        <Text style={styles.empty}>No members on this sheet.</Text>
      ) : sheetQuery.isLoading || sheetQuery.isFetching ? (
        <Text style={styles.empty}>Loading meals…</Text>
      ) : null}

      {summary ? (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Day total</Text>
          <Text style={styles.summaryText}>
            B: {summary.breakfast} · L: {summary.lunch} · D: {summary.dinner} · Total:{" "}
            {summary.total}
          </Text>
        </Card>
      ) : null}

      <Link href="/(app)/meals/history" style={styles.link}>
        View all meal history →
      </Link>
      <Link href="/(app)/meals/summary" style={styles.link}>
        Monthly summary
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  todayLink: {
    color: "#2563eb",
    fontWeight: "600",
  },
  mealRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  roomNo: {
    fontWeight: "400",
    color: "#6b7280",
  },
  rowActions: {
    flexDirection: "row",
    gap: 12,
  },
  editLink: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteLink: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepperCol: {
    alignItems: "center",
    gap: 4,
  },
  stepperLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  stepper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDisabled: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  stepperValue: {
    fontWeight: "600",
    color: "#111827",
  },
  note: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  summaryCard: {
    marginTop: 16,
  },
  summaryTitle: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  summaryText: {
    color: "#6b7280",
  },
  empty: {
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 32,
  },
  link: {
    color: "#2563eb",
    fontWeight: "500",
    marginTop: 12,
  },
});
