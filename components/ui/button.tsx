import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { cn } from "@/lib/utils/cn";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "lg";
  loading?: boolean;
  leftIcon?: ComponentProps<typeof MaterialIcons>["name"];
  rightIcon?: ComponentProps<typeof MaterialIcons>["name"];
  className?: string;
  textClassName?: string;
};

const variantClasses = {
  primary: "bg-primary shadow-md shadow-primary/20 active:bg-primary-dark",
  secondary: "border border-border bg-surface-muted active:bg-border",
  danger: "bg-danger active:opacity-90",
  ghost: "bg-transparent active:bg-surface-muted",
} as const;

const textVariantClasses = {
  primary: "text-white",
  secondary: "text-foreground",
  danger: "text-white",
  ghost: "text-primary",
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
  ...props
}: ButtonProps) {
  const iconColor =
    variant === "primary" || variant === "danger"
      ? "#fffffc"
      : variant === "ghost"
        ? "#0f766e"
        : "#16201f";

  return (
    <Pressable
      className={cn(
        "min-h-11 flex-row items-center justify-center rounded-lg",
        size === "lg" ? "px-5 py-3.5" : "px-4 py-2.5",
        variantClasses[variant],
        (disabled || loading) && "opacity-50",
        className
      )}
      disabled={disabled || loading}
      accessibilityRole="button"
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
              <MaterialIcons name={leftIcon} size={18} color={iconColor} />
            </View>
          ) : null}
          <Text
            className={cn(
              "font-sans text-base font-semibold",
              textVariantClasses[variant],
              textClassName
            )}
          >
            {title}
          </Text>
          {rightIcon ? (
            <View className="ml-2">
              <MaterialIcons name={rightIcon} size={18} color={iconColor} />
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
