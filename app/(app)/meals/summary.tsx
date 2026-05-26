import { Text, View } from "react-native";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { useMealsSummary } from "@/lib/queries/meals";
import { getMonthRange } from "@/lib/utils/dates";

export default function MealSummaryScreen() {
  const { from, to } = getMonthRange();

  const summaryQuery = useMealsSummary(from, to);

  const summary = summaryQuery.data;

  return (
    <Screen
      title="Meal summary"
      subtitle={`${from} to ${to}`}
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
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Total meals: {summary.totalMeals}
            </Text>
          </Card>

          <Text className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            By member
          </Text>
          <View className="gap-2 mb-4">
            {summary.byMember.map((m) => (
              <Card key={m.memberId}>
                <Text className="font-medium text-gray-900 dark:text-gray-100">
                  {m.fullName}
                </Text>
                <Text className="text-gray-500 text-sm">
                  B: {m.breakfast} · L: {m.lunch} · D: {m.dinner} · Total: {m.total}
                </Text>
              </Card>
            ))}
          </View>

          <Text className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            By date
          </Text>
          <View className="gap-2">
            {summary.byDate.map((d) => (
              <Card key={d.date}>
                <Text className="font-medium text-gray-900 dark:text-gray-100">
                  {d.date}
                </Text>
                <Text className="text-gray-500 text-sm">
                  B: {d.breakfast} · L: {d.lunch} · D: {d.dinner} · Total: {d.total}
                </Text>
              </Card>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
