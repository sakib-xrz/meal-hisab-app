import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn("items-center px-4 py-12", className)}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
        <Text className="text-2xl">📋</Text>
      </View>
      <Text className="mb-2 text-center font-sans text-lg font-semibold text-foreground">
        {title}
      </Text>
      {description ? (
        <Text className="mb-6 text-center font-sans text-base text-muted">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}
