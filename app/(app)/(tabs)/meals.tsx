import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { ActionRow } from "@/components/ui/action-row";
import { FadeIn, StaggerList } from "@/components/ui/animated-view";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmSheet,
  useBottomSheetModal,
} from "@/components/ui/bottom-sheet-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MealStepper } from "@/components/ui/meal-stepper";
import { Screen } from "@/components/ui/screen";
import { ShimmerMealRow } from "@/components/ui/shimmer";
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
    <View className="border-b border-border/50 py-4 last:border-b-0">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="mr-3 flex-1 flex-row items-center">
          <Avatar name={row.fullName} size="sm" className="mr-3" />
          <View className="flex-1">
            <Text
              className="font-sans text-base font-semibold text-foreground"
              numberOfLines={1}
            >
              {row.fullName}
            </Text>
            <Text className="font-sans text-xs text-muted" numberOfLines={1}>
              {row.roomNo ? `Room ${row.roomNo}` : "No room assigned"}
            </Text>
          </View>
        </View>
        {!readOnly && hasEntry ? (
          <View className="ml-2 flex-row gap-2">
            <Pressable
              onPress={() => onEdit(row.mealEntryId!)}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-xl bg-primary-soft/80 active:scale-95 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`Edit ${row.fullName}'s meal`}
            >
              <MaterialIcons name="edit" size={18} color="#0b4f4a" />
            </Pressable>
            <Pressable
              onPress={() => onDelete(row.mealEntryId!, row.fullName)}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-xl bg-danger-soft/80 active:scale-95 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`Delete ${row.fullName}'s meal`}
            >
              <MaterialIcons name="delete-outline" size={19} color="#d9385e" />
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
        <Text className="mt-2 px-2 font-sans text-sm italic text-muted">
          {row.note}
        </Text>
      ) : null}
      {!readOnly && hasEntry && !hasMeals ? (
        <Text className="mt-2 px-2 font-sans text-xs text-muted">
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
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const sheetQuery = useDailyMealSheet(date);
  const deleteMutation = useDeleteMealEntry();
  const sheetReady = sheetQuery.data
    ? isSameApiDate(sheetQuery.data.date, date)
    : false;
  const deleteSheet = useBottomSheetModal();

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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const updateRow = useCallback(
    (
      memberId: string,
      field: "breakfast" | "lunch" | "dinner",
      value: number,
    ) => {
      setRows((prev) =>
        prev.map((r) =>
          r.memberId === memberId ? { ...r, [field]: value } : r,
        ),
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
    setDeleteTarget({ id: mealEntryId, name });
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

  const summary = sheetReady ? sheetQuery.data?.summary : undefined;
  const showSkeleton =
    sheetQuery.isLoading || (sheetQuery.isFetching && !sheetReady);

  return (
    <>
      <Screen
        title="Daily meals"
        subtitle={formatDisplayDate(date)}
        refreshing={sheetQuery.isRefetching}
        onRefresh={() => sheetQuery.refetch()}
        contentClassName="pt-2"
        footer={
          isManagerOrAbove ? (
            <Button
              title="Save sheet"
              size="lg"
              loading={saveMutation.isPending}
              disabled={!dirty}
              onPress={handleSave}
              className="mb-20"
            />
          ) : undefined
        }
      >
        {/* Date Switcher Glass Card */}
        <Card
          variant="glass"
          className="mb-5 flex-row items-center justify-between p-2 shadow-sm"
        >
          <Button
            title="Prev"
            leftIcon="chevron-left"
            variant="ghost"
            className="px-3 py-2"
            onPress={() => setDate((d) => shiftDate(d, -1))}
          />
          <Button
            title="Today"
            variant="secondary"
            className="px-4 py-2"
            onPress={() => setDate(todayApiDate())}
          />
          <Button
            title="Next"
            rightIcon="chevron-right"
            variant="ghost"
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

        {showSkeleton ? (
          <Card className="mb-5 p-4">
            <StaggerList staggerMs={80}>
              <ShimmerMealRow />
              <ShimmerMealRow />
              <ShimmerMealRow />
            </StaggerList>
          </Card>
        ) : rows.length > 0 ? (
          <FadeIn delay={50}>
            <Card className="mb-5 p-4">
              <StaggerList staggerMs={50}>
                {rows.map((row) => (
                  <MealRow
                    key={row.memberId}
                    row={row}
                    readOnly={!isManagerOrAbove}
                    onChange={(field, value) =>
                      updateRow(row.memberId, field, value)
                    }
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))}
              </StaggerList>
            </Card>
          </FadeIn>
        ) : sheetQuery.isSuccess && sheetReady ? (
          <EmptyState
            title="No members on this sheet"
            description="Add active members to start tracking meals."
          />
        ) : null}

        {summary ? (
          <FadeIn delay={150}>
            <Card title="Day total" className="mb-5 p-4">
              <View className="flex-row flex-wrap gap-2 pt-1">
                <Badge
                  label={`Breakfast ${summary.breakfast}`}
                  variant="muted"
                  pill
                />
                <Badge
                  label={`Lunch ${summary.lunch}`}
                  variant="primary"
                  pill
                />
                <Badge
                  label={`Dinner ${summary.dinner}`}
                  variant="accent"
                  pill
                />
                <Badge
                  label={`Total ${summary.total}`}
                  variant="default"
                  pill
                />
              </View>
            </Card>
          </FadeIn>
        ) : null}

        <FadeIn delay={200} className="gap-3">
          <Link href="/(app)/meals/history" asChild>
            <ActionRow
              title="View all meal history"
              subtitle="Past entries"
              icon="history"
            />
          </Link>
          <Link href="/(app)/meals/summary" asChild>
            <ActionRow
              title="Monthly summary"
              subtitle="Totals by member and date"
              icon="analytics"
              tone="accent"
            />
          </Link>
        </FadeIn>
      </Screen>
      <ConfirmSheet
        sheetRef={deleteSheet.ref}
        title="Delete meal entry"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.name}'s meal for this day?`
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
