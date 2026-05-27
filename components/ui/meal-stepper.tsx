import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type MealStepValue = 0 | 1;

export function toMealStepValue(value: number): MealStepValue {
  const n = Number(value);
  return n > 0 ? 1 : 0;
}

type MealStepperProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function MealStepper({
  value,
  onChange,
  disabled,
  label,
  className,
}: MealStepperProps) {
  const current = toMealStepValue(value);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const toggle = () => {
    const next = current === 0 ? 1 : 0;
    scale.value = withSpring(0.85, { damping: 12, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onChange(next);
  };

  return (
    <View className={cn("items-center", className)}>
      {label ? (
        <Text className="mb-2 font-sans text-xs font-semibold tracking-wide text-muted">{label}</Text>
      ) : null}
      <AnimatedPressable
        style={animatedStyle}
        onPress={disabled ? undefined : toggle}
        className={cn(
          "h-14 w-[72px] flex-row items-center justify-center rounded-xl border-2",
          disabled
            ? "border-border bg-surface-muted opacity-50"
            : current > 0
              ? "border-primary bg-primary-soft"
              : "border-border bg-surface",
        )}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label} meal count ${current}` : `Meal count ${current}`}
      >
        <MaterialIcons
          name={current > 0 ? "check" : "add"}
          size={18}
          color={current > 0 ? "#0b4f4a" : "#8b9894"}
        />
        <Text
          className={cn(
            "ml-1 font-sans text-lg font-bold",
            current > 0 ? "text-primary-dark" : "text-foreground",
          )}
        >
          {current}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

export const MEAL_OPTIONS = [0, 1] as const;
