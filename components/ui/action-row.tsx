import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type ActionRowProps = PressableProps & {
  title: string;
  subtitle?: string;
  icon?: MaterialIconName;
  right?: React.ReactNode;
  tone?: "primary" | "accent" | "danger" | "muted";
  className?: string;
};

const toneClasses = {
  primary: {
    icon: "bg-primary-soft",
    color: "#0b4f4a",
  },
  accent: {
    icon: "bg-accent-soft",
    color: "#9a5b00",
  },
  danger: {
    icon: "bg-danger-soft",
    color: "#d9385e",
  },
  muted: {
    icon: "bg-surface-muted",
    color: "#52605e",
  },
} as const;

export function ActionRow({
  title,
  subtitle,
  icon,
  right,
  tone = "primary",
  className,
  onPressIn,
  onPressOut,
  ...props
}: ActionRowProps) {
  const currentTone = toneClasses[tone];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={cn(
        "flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-sm shadow-foreground/5",
        className,
      )}
      accessibilityRole="button"
      onPressIn={(e: any) => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
        onPressIn?.(e);
      }}
      onPressOut={(e: any) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        onPressOut?.(e);
      }}
      {...props}
    >
      {icon ? (
        <View className={cn("mr-3.5 h-11 w-11 items-center justify-center rounded-xl", currentTone.icon)}>
          <MaterialIcons name={icon} size={22} color={currentTone.color} />
        </View>
      ) : null}
      <View className="mr-3 flex-1">
        <Text className="font-sans text-base font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-sans text-sm text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <MaterialIcons name="chevron-right" size={22} color="#8b9894" />}
    </AnimatedPressable>
  );
}
