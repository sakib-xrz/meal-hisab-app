import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <View className={cn("mb-3 mt-6 flex-row items-center justify-between", className)}>
      <View className="flex-row items-center gap-2">
        <View className="h-4 w-1 rounded-full bg-primary" />
        <Text className="font-sans text-sm font-bold tracking-wide text-foreground-secondary">
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="font-sans text-sm font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
