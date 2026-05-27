import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <View
      className={cn(
        "items-center rounded-lg border border-danger-soft bg-danger-soft/50 px-4 py-8",
        className
      )}
    >
      <Text className="mb-4 text-center font-sans text-base text-danger">{message}</Text>
      {onRetry ? (
        <Button
          title="Try again"
          variant="secondary"
          leftIcon="refresh"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
