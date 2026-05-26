import { Text, View } from "react-native";
import { Link } from "expo-router";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { useCurrentMess, useMessStats } from "@/lib/queries/mess";
import { formatBdt, formatMealRate } from "@/lib/utils/format";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
      <Text className="text-gray-600 dark:text-gray-400">{label}</Text>
      <Text className="font-semibold text-gray-900 dark:text-gray-100">{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { myRole } = useAuth();

  const messQuery = useCurrentMess();
  const statsQuery = useMessStats();

  const isRefreshing = messQuery.isRefetching || statsQuery.isRefetching;

  const refetch = () => {
    void messQuery.refetch();
    void statsQuery.refetch();
  };

  const mess = messQuery.data;
  const stats = statsQuery.data;
  const error = messQuery.error ?? statsQuery.error;

  return (
    <Screen
      title={mess?.name ?? "Dashboard"}
      subtitle={myRole ? `Your role: ${myRole}` : undefined}
      refreshing={isRefreshing}
      onRefresh={refetch}
    >
      {error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load"}
          onRetry={refetch}
        />
      ) : null}

      {stats ? (
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            This month
          </Text>
          <StatRow label="Active members" value={String(stats.activeMemberCount)} />
          <StatRow label="Total meals" value={String(stats.totalMeals)} />
          <StatRow label="Bazaar cost" value={formatBdt(stats.totalBazaarCost)} />
          <StatRow label="Extra expenses" value={formatBdt(stats.totalExtraExpense)} />
          <StatRow label="Payments" value={formatBdt(stats.totalPayments)} />
          <StatRow label="Meal rate" value={formatMealRate(stats.mealRate)} />
        </Card>
      ) : null}

      {mess ? (
        <Card>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Mess info
          </Text>
          {mess.address ? (
            <Text className="text-gray-600 dark:text-gray-400 mb-1">{mess.address}</Text>
          ) : null}
          {mess.phone ? (
            <Text className="text-gray-600 dark:text-gray-400 mb-1">{mess.phone}</Text>
          ) : null}
          {mess.owner ? (
            <Text className="text-gray-600 dark:text-gray-400 mb-1">
              Owner: {mess.owner.name}
            </Text>
          ) : null}
          <Text className="text-gray-500 text-sm">
            {mess.activeMemberCount ?? 0} active members ·{" "}
            {mess.isActive ? "Active" : "Inactive"}
          </Text>
        </Card>
      ) : null}

      <Link href="/(app)/meals/summary" asChild>
        <Text className="text-blue-600 font-medium mt-4">View meal summary →</Text>
      </Link>
    </Screen>
  );
}
