import { Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type StatRowProps = {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
};

export function StatRow({ label, value, highlight, className }: StatRowProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between border-b border-border/60 py-3.5",
        highlight && "-mx-2 rounded-xl border-b-0 bg-accent-soft/50 px-3.5",
        className,
      )}
    >
      <Text className={cn("font-sans text-base", highlight ? "text-amber-900" : "text-muted")}>
        {label}
      </Text>
      <Text
        className={cn(
          "font-sans text-base font-bold",
          highlight ? "text-amber-900" : "text-foreground",
        )}
      >
        {value}
      </Text>
    </View>
  );
}
