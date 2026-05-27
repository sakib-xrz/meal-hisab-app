import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ActionRow } from "@/components/ui/action-row";
import { FadeIn } from "@/components/ui/animated-view";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/ui/brand-mark";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { MetricTile } from "@/components/ui/metric-tile";
import { Screen } from "@/components/ui/screen";
import { ShimmerCard, ShimmerMetricTile } from "@/components/ui/shimmer";
import { Brand } from "@/constants/theme";
import { useAuth } from "@/context/auth-provider";
import { useCurrentMess, useMessStats } from "@/lib/queries/mess";
import { formatBdt, formatMealRate } from "@/lib/utils/format";

export default function DashboardScreen() {
  const { myRole, user } = useAuth();

  const messQuery = useCurrentMess();
  const statsQuery = useMessStats();

  const isRefreshing = messQuery.isRefetching || statsQuery.isRefetching;
  const isLoading = messQuery.isLoading || statsQuery.isLoading;

  const refetch = () => {
    void messQuery.refetch();
    void statsQuery.refetch();
  };

  const mess = messQuery.data;
  const stats = statsQuery.data;
  const error = messQuery.error ?? statsQuery.error;

  return (
    <Screen
      tabScreen
      contentClassName="pt-4"
      refreshing={isRefreshing}
      onRefresh={refetch}
      greeting={{ name: user?.name }}
    >
      {/* Hero card with gradient */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500).springify().damping(18)}
        className="mb-5 overflow-hidden rounded-2xl shadow-lg shadow-primary-dark/25"
      >
        <LinearGradient
          colors={[Brand.primaryDeep, Brand.primaryDark, Brand.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingVertical: 20 }}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="font-sans text-sm font-semibold tracking-wide text-white/60">
                Current mess
              </Text>
              <Text
                className="mt-1 font-sans text-3xl font-bold text-white"
                numberOfLines={2}
              >
                {mess?.name ?? "Dashboard"}
              </Text>
            </View>
            <BrandMark size="lg" variant="light" />
          </View>
          <View className="mt-5 flex-row flex-wrap gap-2">
            {myRole ? <Badge label={myRole} variant="accent" pill /> : null}
            {mess ? (
              <Badge
                label={mess.isActive ? "Active mess" : "Inactive mess"}
                variant="primary"
                pill
                icon={mess.isActive ? "check-circle" : "pause-circle-filled"}
              />
            ) : null}
          </View>
        </LinearGradient>
      </Animated.View>

      {error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load"}
          onRetry={refetch}
        />
      ) : null}

      {/* Metric tiles with skeletons */}
      {isLoading && !stats ? (
        <View className="mb-1 flex-row flex-wrap justify-between">
          <ShimmerMetricTile className="mb-3 w-[48%]" />
          <ShimmerMetricTile className="mb-3 w-[48%]" />
          <ShimmerMetricTile className="mb-3 w-[48%]" />
          <ShimmerMetricTile className="mb-3 w-[48%]" />
        </View>
      ) : stats ? (
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

      {/* Mess info card */}
      {isLoading && !mess ? (
        <ShimmerCard className="mb-5" />
      ) : mess ? (
        <FadeIn delay={300}>
          <Card variant="glass" title="Mess info" className="mb-5">
            {mess.address ? (
              <Text className="mb-1 font-sans text-base text-muted">
                {mess.address}
              </Text>
            ) : null}
            {mess.phone ? (
              <Text className="mb-1 font-sans text-base text-muted">
                {mess.phone}
              </Text>
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
                pill
                icon="people"
              />
              {stats ? (
                <Badge
                  label={`${formatBdt(stats.totalExtraExpense)} extra`}
                  variant="accent"
                  pill
                />
              ) : null}
            </View>
          </Card>
        </FadeIn>
      ) : null}

      {/* Quick actions */}
      <FadeIn delay={400}>
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
      </FadeIn>
    </Screen>
  );
}
