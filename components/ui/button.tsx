import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ComponentProps<typeof MaterialIcons>["name"];
  rightIcon?: ComponentProps<typeof MaterialIcons>["name"];
  className?: string;
  textClassName?: string;
};

const variantClasses = {
  primary: "bg-primary shadow-md shadow-primary/25",
  secondary: "border border-border bg-surface-muted",
  danger: "bg-danger shadow-md shadow-danger/20",
  ghost: "bg-transparent",
} as const;

const textVariantClasses = {
  primary: "text-white",
  secondary: "text-foreground",
  danger: "text-white",
  ghost: "text-primary",
} as const;

const sizeClasses = {
  sm: "px-3 py-2 min-h-9",
  md: "px-4 py-2.5 min-h-11",
  lg: "px-5 py-3.5 min-h-[52px]",
} as const;

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
} as const;

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  leftIcon,
  rightIcon,
  className,
  textClassName,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor =
    variant === "primary" || variant === "danger"
      ? "#fffffc"
      : variant === "ghost"
        ? "#0f766e"
        : "#16201f";

  const iconSize = size === "sm" ? 16 : 18;

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={cn(
        "flex-row items-center justify-center rounded-xl",
        sizeClasses[size],
        variantClasses[variant],
        (disabled || loading) && "opacity-50",
        className,
      )}
      disabled={disabled || loading}
      accessibilityRole="button"
      onPressIn={(e: any) => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPressIn?.(e);
      }}
      onPressOut={(e: any) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" || variant === "ghost" ? "#16201f" : "#fffffc"}
        />
      ) : (
        <>
          {leftIcon ? (
            <View className="mr-2">
              <MaterialIcons name={leftIcon} size={iconSize} color={iconColor} />
            </View>
          ) : null}
          <Text
            className={cn(
              "font-sans font-semibold",
              textSizeClasses[size],
              textVariantClasses[variant],
              textClassName,
            )}
          >
            {title}
          </Text>
          {rightIcon ? (
            <View className="ml-2">
              <MaterialIcons name={rightIcon} size={iconSize} color={iconColor} />
            </View>
          ) : null}
        </>
      )}
    </AnimatedPressable>
  );
}
