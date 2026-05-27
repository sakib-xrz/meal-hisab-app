import { Text, View, type ViewProps } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

type CardVariant = "default" | "glass" | "elevated";

type CardProps = ViewProps & {
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  animated?: boolean;
  animationDelay?: number;
  className?: string;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border border-border bg-surface",
  glass: "border border-glass-border bg-glass",
  elevated: "border border-border bg-surface-elevated",
};

export function Card({
  title,
  subtitle,
  variant = "default",
  animated = false,
  animationDelay = 0,
  children,
  className,
  ...props
}: CardProps) {
  const Wrapper = animated ? Animated.View : View;
  const entering = animated
    ? FadeInDown.delay(animationDelay).duration(400)
    : undefined;

  return (
    <Wrapper
      // @ts-ignore — entering only used on Animated.View
      entering={entering}
      className={cn(
        "rounded-2xl p-4 shadow-sm shadow-foreground/5",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {title ? (
        <Text className="mb-1 font-sans text-lg font-bold text-foreground">
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mb-3 font-sans text-sm text-muted">{subtitle}</Text>
      ) : null}
      {children}
    </Wrapper>
  );
}
