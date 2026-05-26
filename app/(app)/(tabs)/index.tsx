import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { StatRow } from "@/components/ui/stat-row";
import { useAuth } from "@/context/auth-provider";
import { useCurrentMess, useMessStats } from "@/lib/queries/mess";
import { formatBdt, formatMealRate } from "@/lib/utils/format";

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
        <Card title="This month" className="mb-4">
          <StatRow label="Active members" value={String(stats.activeMemberCount)} />
          <StatRow label="Total meals" value={String(stats.totalMeals)} />
          <StatRow label="Bazaar cost" value={formatBdt(stats.totalBazaarCost)} />
          <StatRow label="Extra expenses" value={formatBdt(stats.totalExtraExpense)} />
          <StatRow label="Payments" value={formatBdt(stats.totalPayments)} />
          <StatRow label="Meal rate" value={formatMealRate(stats.mealRate)} highlight />
        </Card>
      ) : null}

      {mess ? (
        <Card title="Mess info">
          {mess.address ? (
            <Text className="mb-1 font-sans text-base text-muted">{mess.address}</Text>
          ) : null}
          {mess.phone ? (
            <Text className="mb-1 font-sans text-base text-muted">{mess.phone}</Text>
          ) : null}
          {mess.owner ? (
            <Text className="mb-2 font-sans text-base text-muted">
              Owner: {mess.owner.name}
            </Text>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            <Badge
              label={`${mess.activeMemberCount ?? 0} active members`}
              variant="primary"
            />
            <Badge label={mess.isActive ? "Active" : "Inactive"} variant="muted" />
          </View>
        </Card>
      ) : null}

      <View className="mt-6 gap-3">
        <Link href="/(app)/meals/summary" asChild>
          <Pressable className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 active:opacity-80">
            <View>
              <Text className="font-sans text-base font-semibold text-foreground">
                Meal summary
              </Text>
              <Text className="font-sans text-sm text-muted">Monthly breakdown</Text>
            </View>
            <Text className="font-sans text-xl text-primary">›</Text>
          </Pressable>
        </Link>
        <Link href="/(app)/meals/history" asChild>
          <Pressable className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4 active:opacity-80">
            <View>
              <Text className="font-sans text-base font-semibold text-foreground">
                Meal history
              </Text>
              <Text className="font-sans text-sm text-muted">View past entries</Text>
            </View>
            <Text className="font-sans text-xl text-primary">›</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
