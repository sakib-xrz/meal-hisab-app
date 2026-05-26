import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button, Label } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingScreen, Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import {
  useDailyMealSheet,
  useDeleteMealEntry,
  useMealsList,
  useUpdateMealEntry,
} from "@/lib/queries/meals";
import { getMonthRange } from "@/lib/utils/dates";

const MEAL_OPTIONS = [0, 0.5, 1] as const;

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const cycle = () => {
    const idx = MEAL_OPTIONS.indexOf(value as (typeof MEAL_OPTIONS)[number]);
    onChange(MEAL_OPTIONS[(idx + 1) % MEAL_OPTIONS.length]);
  };

  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Pressable onPress={cycle} style={styles.stepperBtn}>
        <Text style={styles.stepperValue}>{value}</Text>
      </Pressable>
    </View>
  );
}

export default function EditMealEntryScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{ id: string; date?: string }>();
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
  const isLoading = listQuery.isLoading || (dateParam ? dailyQuery.isLoading : false);

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
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete entry", "Remove this meal entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(id!, {
            onSuccess: () => {
              Toast.show({ type: "success", text1: "Entry deleted" });
              router.back();
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

  if (!isManagerOrAbove) {
    return (
      <Screen title="Meal entry">
        <Text style={styles.empty}>You do not have permission to edit meals.</Text>
      </Screen>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!entry) {
    return (
      <Screen title="Meal entry">
        <Text style={styles.empty}>Entry not found.</Text>
      </Screen>
    );
  }

  const queryError = listQuery.error ?? dailyQuery.error;

  return (
    <Screen
      title="Edit meal"
      subtitle={`${entry.mealDate} · ${entry.member.fullName}`}
      keyboardAvoid
      footer={
        <View style={styles.footer}>
          <Button title="Save changes" loading={saveMutation.isPending} onPress={handleSave} />
          <Button title="Delete entry" variant="danger" onPress={handleDelete} />
        </View>
      }
    >
      {queryError ? (
        <ErrorState
          message={queryError instanceof Error ? queryError.message : "Failed to load"}
          onRetry={() => {
            void listQuery.refetch();
            if (dateParam) void dailyQuery.refetch();
          }}
        />
      ) : null}

      <Stepper label="Breakfast" value={breakfast} onChange={setBreakfast} />
      <Stepper label="Lunch" value={lunch} onChange={setLunch} />
      <Stepper label="Dinner" value={dinner} onChange={setDinner} />

      <View style={styles.noteField}>
        <Label>Note</Label>
        <Input
          placeholder="Optional note"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stepperLabel: { fontSize: 16, color: "#374151" },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { fontSize: 16, fontWeight: "600", color: "#111827" },
  noteField: {
    marginTop: 8,
  },
  footer: { gap: 12 },
  empty: { color: "#6b7280", textAlign: "center", paddingVertical: 32 },
});
