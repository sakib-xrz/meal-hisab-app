import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [floatY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className={cn("items-center px-4 py-14", className)}>
      <Animated.View
        style={floatStyle}
        className="mb-5 h-[72px] w-[72px] items-center justify-center rounded-2xl bg-primary-soft"
      >
        <MaterialIcons name="inbox" size={32} color="#0b4f4a" />
      </Animated.View>
      <Text className="mb-2 text-center font-sans text-lg font-bold text-foreground">
        {title}
      </Text>
      {description ? (
        <Text className="mb-6 text-center font-sans text-base leading-6 text-muted">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          leftIcon="add"
          onPress={onAction}
          variant="secondary"
        />
      ) : null}
    </View>
  );
}
