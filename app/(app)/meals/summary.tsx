import { Text, View } from "react-native";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { useMealsSummary } from "@/lib/queries/meals";
import { formatDisplayDate, formatShortDate, getMonthRange } from "@/lib/utils/dates";

export default function MealSummaryScreen() {
  const { from, to } = getMonthRange();

  const summaryQuery = useMealsSummary(from, to);

  const summary = summaryQuery.data;

  return (
    <Screen
      edges={[]}
      subtitle={`${formatShortDate(from)} – ${formatShortDate(to)}`}
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

      {summary ? (
        <>
          <Card className="mb-4">
            <Text className="font-sans text-2xl font-bold text-foreground">
              {summary.totalMeals}
            </Text>
            <Text className="font-sans text-sm text-muted">Total meals this month</Text>
          </Card>

          <SectionHeader title="By member" className="mt-0" />
          <View className="mb-4 gap-2">
            {summary.byMember.map((m) => (
              <Card key={m.memberId}>
                <Text className="font-sans text-base font-semibold text-foreground">
                  {m.fullName}
                </Text>
                <Text className="mt-1 font-sans text-sm text-muted">
                  B: {m.breakfast} · L: {m.lunch} · D: {m.dinner} · Total: {m.total}
                </Text>
              </Card>
            ))}
          </View>

          <SectionHeader title="By date" />
          <View className="gap-2">
            {summary.byDate.map((d) => (
              <Card key={d.date}>
                <Text className="font-sans text-base font-semibold text-foreground">
                  {formatDisplayDate(d.date)}
                </Text>
                <Text className="mt-1 font-sans text-sm text-muted">
                  B: {d.breakfast} · L: {d.lunch} · D: {d.dinner} · Total: {d.total}
                </Text>
              </Card>
            ))}
          </View>
        </>
      ) : summaryQuery.isSuccess ? (
        <EmptyState title="No meal data" description="No meals recorded for this period." />
      ) : null}
    </Screen>
  );
}
