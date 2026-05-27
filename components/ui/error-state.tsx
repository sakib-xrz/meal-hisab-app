import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, [shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View
      style={shakeStyle}
      className={cn(
        "items-center rounded-2xl border border-danger-soft bg-danger-soft/40 px-5 py-8",
        className,
      )}
    >
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-danger-soft">
        <MaterialIcons name="error-outline" size={28} color="#d9385e" />
      </View>
      <Text className="mb-5 text-center font-sans text-base leading-6 text-danger">
        {message}
      </Text>
      {onRetry ? (
        <Button
          title="Try again"
          variant="secondary"
          leftIcon="refresh"
          onPress={onRetry}
        />
      ) : null}
    </Animated.View>
  );
}
