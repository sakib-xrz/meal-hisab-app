import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
  disabled,
}: SegmentControlProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const indicatorLeft = useSharedValue(selectedIndex >= 0 ? selectedIndex : 0);

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      indicatorLeft.value = withSpring(idx, { damping: 18, stiffness: 160 });
    }
  }, [value, options, indicatorLeft]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${(indicatorLeft.value / options.length) * 100}%` as any,
    width: `${100 / options.length}%` as any,
  }));

  return (
    <View
      className={cn(
        "relative flex-row overflow-hidden rounded-xl border border-border bg-surface-muted p-1",
        className,
      )}
    >
      {/* Animated sliding indicator */}
      <Animated.View
        style={indicatorStyle}
        className="absolute bottom-1 top-1 rounded-full bg-surface shadow-sm shadow-black/8"
      />

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <AnimatedPressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            className={cn(
              "z-10 min-h-8 flex-1 items-center justify-center rounded-lg",
              disabled && "opacity-50",
            )}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              className={cn(
                "font-sans text-sm font-semibold",
                selected ? "text-primary" : "text-muted",
              )}
            >
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
