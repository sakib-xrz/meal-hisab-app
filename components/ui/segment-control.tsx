import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

import { Brand } from "@/constants/theme";
import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 22, stiffness: 260, mass: 0.75 };

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentVariant = "default" | "glass";
type SegmentSize = "sm" | "md";

type SegmentControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: SegmentVariant;
  size?: SegmentSize;
  className?: string;
  disabled?: boolean;
};

const trackClasses: Record<SegmentVariant, string> = {
  default: "border-border/80 bg-surface-muted/90",
  glass: "border-glass-border bg-glass-border/20",
};

const indicatorClasses: Record<SegmentVariant, string> = {
  default: "border-primary/15 bg-surface-elevated shadow-sm shadow-primary/10",
  glass: "border-glass-border bg-glass-strong shadow-sm shadow-foreground/10",
};

const sizeClasses: Record<
  SegmentSize,
  { track: string; segment: string; text: string }
> = {
  sm: {
    track: "p-1",
    segment: "min-h-9 px-1",
    text: "text-xs",
  },
  md: {
    track: "p-1.5",
    segment: "min-h-10 px-1.5",
    text: "text-sm",
  },
};

type SegmentLabelProps = {
  index: number;
  label: string;
  indicatorIndex: SharedValue<number>;
  textClassName: string;
};

function SegmentLabel({
  index,
  label,
  indicatorIndex,
  textClassName,
}: SegmentLabelProps) {
  const textStyle = useAnimatedStyle(() => {
    const distance = Math.min(Math.abs(indicatorIndex.value - index), 1);

    return {
      color: interpolateColor(
        distance,
        [0, 1],
        [Brand.primaryDark, Brand.muted],
      ),
    };
  });

  return (
    <Animated.Text
      style={textStyle}
      className={cn("font-sans font-semibold", textClassName)}
    >
      {label}
    </Animated.Text>
  );
}

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  variant = "default",
  size = "md",
  className,
  disabled,
}: SegmentControlProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const indicatorIndex = useSharedValue(selectedIndex >= 0 ? selectedIndex : 0);
  const segmentX = useSharedValue(0);
  const segmentY = useSharedValue(0);
  const segmentWidth = useSharedValue(0);
  const segmentHeight = useSharedValue(0);
  const [measured, setMeasured] = useState(false);

  const sizing = sizeClasses[size];

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      indicatorIndex.value = withSpring(idx, SPRING);
    }
  }, [value, options, indicatorIndex]);

  const handleSegmentLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;

    segmentX.value = x;
    segmentY.value = y;
    segmentWidth.value = width;
    segmentHeight.value = height;
    setMeasured(true);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    left: segmentX.value + indicatorIndex.value * segmentWidth.value,
    top: segmentY.value,
    width: segmentWidth.value,
    height: segmentHeight.value,
  }));

  const handlePress = (optionValue: T) => {
    if (disabled) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    onChange(optionValue);
  };

  return (
    <View
      className={cn(
        "relative flex-row overflow-hidden rounded-full border pb-2 px-2",
        trackClasses[variant],
        sizing.track,
        "items-center justify-center",
        disabled && "opacity-50",
        className,
      )}
      accessibilityRole="tablist"
    >
      <Animated.View
        style={indicatorStyle}
        className={cn(
          "absolute rounded-full border",
          indicatorClasses[variant],
          !measured && "opacity-0",
        )}
        pointerEvents="none"
      />

      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <AnimatedPressable
            key={option.value}
            onLayout={index === 0 ? handleSegmentLayout : undefined}
            onPress={() => handlePress(option.value)}
            disabled={disabled}
            className={cn(
              "z-10 flex-1 items-center justify-center rounded-lg active:opacity-80",
              sizing.segment,
            )}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            accessibilityLabel={option.label}
          >
            <SegmentLabel
              index={index}
              label={option.label}
              indicatorIndex={indicatorIndex}
              textClassName={sizing.text}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}
