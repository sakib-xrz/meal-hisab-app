import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { Text, View, type ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type MetricTone = "primary" | "accent" | "info" | "danger" | "muted";

type MetricTileProps = ViewProps & {
  label: string;
  value: string;
  icon?: MaterialIconName;
  tone?: MetricTone;
  animated?: boolean;
  className?: string;
};

const toneClasses: Record<
  MetricTone,
  { tile: string; icon: string; iconColor: string }
> = {
  primary: {
    tile: "border-primary-soft/70 bg-primary-soft/40",
    icon: "bg-primary",
    iconColor: "#fffffc",
  },
  accent: {
    tile: "border-accent-soft/70 bg-accent-soft/50",
    icon: "bg-accent",
    iconColor: "#16201f",
  },
  info: {
    tile: "border-info-soft/70 bg-info-soft/50",
    icon: "bg-info",
    iconColor: "#fffffc",
  },
  danger: {
    tile: "border-danger-soft/70 bg-danger-soft/45",
    icon: "bg-danger",
    iconColor: "#fffffc",
  },
  muted: {
    tile: "border-border bg-surface-muted/60",
    icon: "bg-foreground-secondary",
    iconColor: "#fffffc",
  },
};

export function MetricTile({
  label,
  value,
  icon,
  tone = "primary",
  animated = true,
  className,
  ...props
}: MetricTileProps) {
  const classes = toneClasses[tone];
  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 8 : 0);

  useEffect(() => {
    if (animated) {
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [animated, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn(
        "rounded-2xl border p-4 shadow-sm shadow-foreground/5",
        classes.tile,
        className,
      )}
      {...props}
    >
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-sans text-xs font-semibold tracking-wide text-foreground-secondary">
          {label}
        </Text>
        {icon ? (
          <View
            className={cn(
              "h-9 w-9 items-center justify-center rounded-xl",
              classes.icon,
            )}
          >
            <MaterialIcons name={icon} size={18} color={classes.iconColor} />
          </View>
        ) : null}
      </View>
      <Text
        className="font-sans text-xl font-bold text-foreground"
        numberOfLines={1}
      >
        {value}
      </Text>
    </Animated.View>
  );
}
