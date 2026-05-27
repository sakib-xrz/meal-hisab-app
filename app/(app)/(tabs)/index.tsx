import { Link } from "expo-router";
import { Text, View } from "react-native";

import { ActionRow } from "@/components/ui/action-row";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/ui/brand-mark";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { MetricTile } from "@/components/ui/metric-tile";
import { Screen } from "@/components/ui/screen";
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
      contentClassName="pt-4"
      refreshing={isRefreshing}
      onRefresh={refetch}
    >
      <View className="mb-4 overflow-hidden rounded-xl bg-primary-dark px-5 py-5 shadow-lg shadow-primary-dark/20">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="font-sans text-sm font-semibold text-white/70">
              Current mess
            </Text>
            <Text className="mt-1 font-sans text-3xl font-bold text-white" numberOfLines={2}>
              {mess?.name ?? "Dashboard"}
            </Text>
          </View>
          <BrandMark size="lg" variant="light" />
        </View>
        <View className="mt-5 flex-row flex-wrap gap-2">
          {myRole ? <Badge label={myRole} variant="accent" /> : null}
          {mess ? (
            <Badge label={mess.isActive ? "Active mess" : "Inactive mess"} variant="primary" />
          ) : null}
        </View>
      </View>

      {error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load"}
          onRetry={refetch}
        />
      ) : null}

      {stats ? (
        <View className="mb-1 flex-row flex-wrap justify-between">
          <MetricTile
            label="Meal rate"
            value={formatMealRate(stats.mealRate)}
            icon="speed"
            tone="accent"
            className="mb-3 w-[48%]"
          />
          <MetricTile
            label="Total meals"
            value={String(stats.totalMeals)}
            icon="restaurant"
            className="mb-3 w-[48%]"
          />
          <MetricTile
            label="Bazaar cost"
            value={formatBdt(stats.totalBazaarCost)}
            icon="shopping-bag"
            tone="info"
            className="mb-3 w-[48%]"
          />
          <MetricTile
            label="Payments"
            value={formatBdt(stats.totalPayments)}
            icon="payments"
            tone="muted"
            className="mb-3 w-[48%]"
          />
        </View>
      ) : null}

      {mess ? (
        <Card title="Mess info" className="mb-4">
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
              label={`${stats?.activeMemberCount ?? mess.activeMemberCount ?? 0} active members`}
              variant="primary"
            />
            {stats ? (
              <Badge
                label={`${formatBdt(stats.totalExtraExpense)} extra`}
                variant="accent"
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      <View className="gap-3">
        <Link href="/(app)/meals/summary" asChild>
          <ActionRow
            title="Meal summary"
            subtitle="Monthly member breakdown"
            icon="analytics"
            tone="accent"
          />
        </Link>
        <Link href="/(app)/meals/history" asChild>
          <ActionRow
            title="Meal history"
            subtitle="Review and edit entries"
            icon="history"
          />
        </Link>
      </View>
    </Screen>
  );
}
