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
    <View className={cn("mb-2 mt-4 flex-row items-center justify-between", className)}>
      <Text className="font-sans text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="font-sans text-sm font-semibold text-primary">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
