import { router } from "expo-router";
import { Text, View } from "react-native";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { MetricTile } from "@/components/ui/metric-tile";
import { Screen } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { ShimmerCard, ShimmerMetricTile } from "@/components/ui/shimmer";
import { StaggerList } from "@/components/ui/animated-view";
import { useMealsSummary } from "@/lib/queries/meals";
import {
  formatDisplayDate,
  formatShortDate,
  getMonthRange,
} from "@/lib/utils/dates";

export default function MealSummaryScreen() {
  const { from, to } = getMonthRange();

  const summaryQuery = useMealsSummary(from, to);

  const summary = summaryQuery.data;
  const hasMealData = Boolean(
    summary &&
      (summary.totalMeals > 0 ||
        summary.byMember.length > 0 ||
        summary.byDate.length > 0),
  );
  const showSkeleton =
    summaryQuery.isLoading || (summaryQuery.isFetching && !summary);

  return (
    <Screen
      edges={[]}
      subtitle={`${formatShortDate(from)} - ${formatShortDate(to)}`}
      refreshing={summaryQuery.isRefetching}
      onRefresh={() => summaryQuery.refetch()}
    >
      {summaryQuery.error ? (
        <ErrorState
          message={
            summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : "Failed to load"
          }
          onRetry={() => summaryQuery.refetch()}
        />
      ) : null}

      {showSkeleton ? (
        <View className="gap-4">
          <ShimmerMetricTile className="mb-2" />
          <SectionHeader title="By member" className="mt-2" />
          <View className="gap-3">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </View>
        </View>
      ) : summary && hasMealData ? (
        <>
          <MetricTile
            label="Total meals this month"
            value={String(summary.totalMeals)}
            icon="restaurant"
            tone="accent"
            className="mb-4"
          />

          <SectionHeader title="By member" className="mt-0" />
          <View className="mb-4 gap-3.5">
            <StaggerList staggerMs={40}>
              {summary.byMember.map((m) => (
                <Card variant="glass" key={m.memberId}>
                  <View className="mb-3 flex-row items-center justify-between gap-3">
                    <Text className="flex-1 font-sans text-base font-semibold text-foreground">
                      {m.fullName}
                    </Text>
                    <Badge label={`${m.total} total`} variant="primary" />
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    <Badge label={`B ${m.breakfast}`} variant="muted" />
                    <Badge label={`L ${m.lunch}`} variant="accent" />
                    <Badge label={`D ${m.dinner}`} variant="default" />
                  </View>
                </Card>
              ))}
            </StaggerList>
          </View>

          <SectionHeader title="By date" />
          <View className="gap-3.5 mb-6">
            <StaggerList staggerMs={35}>
              {summary.byDate.map((d) => (
                <Card variant="glass" key={d.date}>
                  <View className="mb-3 flex-row items-center justify-between gap-3">
                    <Text className="flex-1 font-sans text-base font-semibold text-foreground">
                      {formatDisplayDate(d.date)}
                    </Text>
                    <Badge label={`${d.total} total`} variant="primary" />
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    <Badge label={`B ${d.breakfast}`} variant="muted" />
                    <Badge label={`L ${d.lunch}`} variant="accent" />
                    <Badge label={`D ${d.dinner}`} variant="default" />
                  </View>
                </Card>
              ))}
            </StaggerList>
          </View>
        </>
      ) : summaryQuery.isSuccess ? (
        <EmptyState
          title="No meal data"
          description="No meals have been recorded for this month yet."
          actionLabel="Record meals"
          onAction={() => router.push("/(app)/(tabs)/meals")}
        />
      ) : null}
    </Screen>
  );
}
