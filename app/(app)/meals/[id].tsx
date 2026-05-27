import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSheet, useBottomSheetModal } from "@/components/ui/bottom-sheet-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealStepper } from "@/components/ui/meal-stepper";
import { Screen } from "@/components/ui/screen";
import { Shimmer, ShimmerEditMeal } from "@/components/ui/shimmer";
import { FadeIn } from "@/components/ui/animated-view";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import {
  useDailyMealSheet,
  useDeleteMealEntry,
  useMealsList,
  useUpdateMealEntry,
} from "@/lib/queries/meals";
import { formatDisplayDate, getMonthRange } from "@/lib/utils/dates";

export default function EditMealEntryScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{
    id: string;
    date?: string;
  }>();
  const { isManagerOrAbove } = useAuth();

  const range = useMemo(() => {
    if (dateParam) return { from: dateParam, to: dateParam };
    return getMonthRange();
  }, [dateParam]);

  const listQuery = useMealsList(range.from, range.to);
  const dailyQuery = useDailyMealSheet(dateParam ?? "", Boolean(dateParam));

  const entryFromList = listQuery.data?.entries.find((e) => e.id === id);
  const entryFromDaily = dateParam
    ? dailyQuery.data?.members
        .filter((m) => m.mealEntryId === id)
        .map((m) => ({
          id: m.mealEntryId!,
          memberId: m.memberId,
          mealDate: dateParam,
          breakfast: m.breakfast,
          lunch: m.lunch,
          dinner: m.dinner,
          total: m.breakfast + m.lunch + m.dinner,
          note: m.note,
          member: { fullName: m.fullName, roomNo: m.roomNo },
        }))[0]
    : undefined;

  const entry = entryFromList ?? entryFromDaily;
  const isLoading =
    listQuery.isPending || (dateParam ? dailyQuery.isPending : false);

  const [breakfast, setBreakfast] = useState(0);
  const [lunch, setLunch] = useState(0);
  const [dinner, setDinner] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!entry) return;
    setBreakfast(entry.breakfast);
    setLunch(entry.lunch);
    setDinner(entry.dinner);
    setNote(entry.note ?? "");
  }, [entry]);

  const saveMutation = useUpdateMealEntry();
  const deleteMutation = useDeleteMealEntry();
  const deleteSheet = useBottomSheetModal();

  const handleSave = () => {
    saveMutation.mutate(
      {
        mealEntryId: id!,
        input: {
          breakfast,
          lunch,
          dinner,
          note: note.trim() || null,
        },
      },
      {
        onSuccess: () => {
          Toast.show({ type: "success", text1: "Meal updated" });
          router.back();
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    deleteSheet.open();
  };

  const confirmDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Entry deleted" });
        deleteSheet.close();
        router.back();
      },
      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2:
            err instanceof ApiError
              ? err.message
              : "Something went wrong",
        });
      },
    });
  };

  if (!isManagerOrAbove) {
    return (
      <Screen edges={[]}>
        <EmptyState
          title="Access denied"
          description="You do not have permission to edit meals."
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen
        edges={[]}
        keyboardAvoid
        footer={
          <View className="gap-3">
            <Shimmer height={52} borderRadius={12} />
            <Shimmer height={52} borderRadius={12} />
          </View>
        }
      >
        <ShimmerEditMeal />
      </Screen>
    );
  }

  if (!entry) {
    return (
      <Screen edges={[]}>
        <EmptyState title="Not found" description="Meal entry not found." />
      </Screen>
    );
  }

  const queryError = listQuery.error ?? dailyQuery.error;

  return (
    <>
      <Screen
      edges={[]}
      subtitle={`${formatDisplayDate(entry.mealDate)} - ${entry.member.fullName}`}
      keyboardAvoid
      footer={
        <View className="gap-3">
          <Button
            title="Save changes"
            leftIcon="save"
            loading={saveMutation.isPending}
            onPress={handleSave}
          />
          <Button
            title="Delete entry"
            variant="danger"
            leftIcon="delete-outline"
            onPress={handleDelete}
          />
        </View>
      }
    >
      {queryError ? (
        <ErrorState
          message={
            queryError instanceof Error ? queryError.message : "Failed to load"
          }
          onRetry={() => {
            void listQuery.refetch();
            if (dateParam) void dailyQuery.refetch();
          }}
        />
      ) : null}

      <FadeIn delay={100}>
        <Card variant="glass" className="mb-4">
          <View className="flex-row justify-between px-2">
            <MealStepper
              label="Breakfast"
              value={breakfast}
              onChange={setBreakfast}
            />
            <MealStepper label="Lunch" value={lunch} onChange={setLunch} />
            <MealStepper label="Dinner" value={dinner} onChange={setDinner} />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <View className="mb-6">
          <Label>Note</Label>
          <Input
            placeholder="Optional note"
            value={note}
            onChangeText={setNote}
            multiline
            className="min-h-[80px]"
          />
        </View>
      </FadeIn>

    </Screen>
      <ConfirmSheet
        sheetRef={deleteSheet.ref}
        title="Delete meal entry"
        description={`Remove ${entry.member.fullName}'s meal on ${formatDisplayDate(entry.mealDate)}?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
