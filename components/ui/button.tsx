import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/lib/utils/cn";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "lg";
  loading?: boolean;
  className?: string;
  textClassName?: string;
};

const variantClasses = {
  primary: "bg-primary active:bg-primary-dark",
  secondary: "bg-slate-100 active:bg-slate-200 border border-border",
  danger: "bg-danger active:opacity-90",
  ghost: "bg-transparent active:bg-slate-100",
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
  className,
  textClassName,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        "items-center justify-center rounded-xl",
        size === "lg" ? "px-5 py-3.5" : "px-4 py-3",
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
          color={variant === "secondary" || variant === "ghost" ? "#0f172a" : "#ffffff"}
        />
      ) : (
        <Text
          className={cn(
            "font-sans text-base font-semibold",
            textVariantClasses[variant],
            textClassName
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
