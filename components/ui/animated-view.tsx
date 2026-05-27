import { type PropsWithChildren, type ReactElement, Children, cloneElement, isValidElement } from "react";
import { Pressable, type PressableProps, type ViewProps } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedProps,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

// ─── FadeIn ──────────────────────────────────────────────

type FadeInProps = PropsWithChildren<{
  delay?: number;
  duration?: number;
  direction?: "up" | "down";
  className?: string;
}>;

export function FadeIn({
  children,
  delay = 0,
  duration = 400,
  direction = "up",
  className,
}: FadeInProps) {
  const Entering =
    direction === "up"
      ? FadeInDown.delay(delay).duration(duration).springify().damping(18)
      : FadeInUp.delay(delay).duration(duration).springify().damping(18);

  return (
    <Animated.View entering={Entering} className={className}>
      {children}
    </Animated.View>
  );
}

// ─── StaggerList ─────────────────────────────────────────

type StaggerListProps = PropsWithChildren<{
  staggerMs?: number;
  initialDelay?: number;
  className?: string;
}>;

export function StaggerList({
  children,
  staggerMs = 60,
  initialDelay = 0,
  className,
}: StaggerListProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <>
      {items.map((child, index) => (
        <FadeIn
          key={(child as ReactElement).key ?? index}
          delay={initialDelay + index * staggerMs}
          className={className}
        >
          {child}
        </FadeIn>
      ))}
    </>
  );
}

// ─── ScalePress ──────────────────────────────────────────

type ScalePressProps = PressableProps & {
  scaleValue?: number;
  className?: string;
  children: React.ReactNode;
};

export function ScalePress({
  scaleValue = 0.97,
  children,
  className,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle} className={cn(className)}>
      <Pressable
        onPressIn={(e) => {
          scale.value = withSpring(scaleValue, { damping: 15, stiffness: 200 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 15, stiffness: 200 });
          onPressOut?.(e);
        }}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
