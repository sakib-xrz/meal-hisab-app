import { Text, View } from "react-native";
import { Button } from "./button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View className="items-center py-8 gap-3">
      <Text className="text-red-600 text-center">{message}</Text>
      {onRetry ? <Button title="Retry" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
