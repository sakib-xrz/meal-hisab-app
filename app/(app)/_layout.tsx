import { Stack } from "expo-router";

import { stackHeaderOptions } from "@/components/ui/app-header";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="members/add"
        options={{
          presentation: "modal",
          ...stackHeaderOptions("Add Member"),
        }}
      />
      <Stack.Screen
        name="members/[id]"
        options={stackHeaderOptions("Edit Member")}
      />
      <Stack.Screen
        name="meals/summary"
        options={stackHeaderOptions("Meal Summary")}
      />
      <Stack.Screen
        name="meals/history"
        options={stackHeaderOptions("Meal History")}
      />
      <Stack.Screen
        name="meals/[id]"
        options={stackHeaderOptions("Edit Meal")}
      />
      <Stack.Screen
        name="settings/transfer-ownership"
        options={stackHeaderOptions("Transfer Ownership")}
      />
    </Stack>
  );
}
