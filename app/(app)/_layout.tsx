import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="members/add"
        options={{ presentation: "modal", headerShown: true, title: "Add Member" }}
      />
      <Stack.Screen
        name="members/[id]"
        options={{ headerShown: true, title: "Edit Member" }}
      />
      <Stack.Screen
        name="meals/summary"
        options={{ headerShown: true, title: "Meal Summary" }}
      />
      <Stack.Screen
        name="meals/history"
        options={{ headerShown: true, title: "Meal History" }}
      />
      <Stack.Screen
        name="meals/[id]"
        options={{ headerShown: true, title: "Edit Meal" }}
      />
      <Stack.Screen
        name="settings/transfer-ownership"
        options={{ headerShown: true, title: "Transfer Ownership" }}
      />
    </Stack>
  );
}
