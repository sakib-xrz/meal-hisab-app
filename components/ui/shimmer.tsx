import { useEffect } from "react";
import { View, type DimensionValue } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

type ShimmerProps = {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
};

function ShimmerBase({ width, height = 16, borderRadius = 8, className }: ShimmerProps) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * ((Math.sin(translateX.value * Math.PI) + 1) / 2),
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: "#dbe5dc",
        },
      ]}
      className={cn(className)}
    />
  );
}

export function Shimmer(props: ShimmerProps) {
  return <ShimmerBase {...props} />;
}

export function ShimmerAvatar({ size = 48 }: { size?: number }) {
  return <ShimmerBase width={size} height={size} borderRadius={size / 2} />;
}

export function ShimmerRow({ className }: { className?: string }) {
  return (
    <View className={cn("flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4", className)}>
      <ShimmerAvatar size={40} />
      <View className="flex-1 gap-2">
        <ShimmerBase height={14} width="60%" borderRadius={6} />
        <ShimmerBase height={10} width="40%" borderRadius={6} />
      </View>
      <ShimmerBase height={24} width={60} borderRadius={12} />
    </View>
  );
}

export function ShimmerCard({ className }: { className?: string }) {
  return (
    <View className={cn("rounded-2xl border border-border bg-surface p-5 gap-3", className)}>
      <ShimmerBase height={14} width="50%" borderRadius={6} />
      <ShimmerBase height={10} width="80%" borderRadius={6} />
      <View className="mt-2 flex-row gap-2">
        <ShimmerBase height={28} width={80} borderRadius={14} />
        <ShimmerBase height={28} width={80} borderRadius={14} />
      </View>
    </View>
  );
}

export function ShimmerMetricTile({ className }: { className?: string }) {
  return (
    <View className={cn("rounded-2xl border border-border bg-surface-muted/60 p-4", className)}>
      <View className="mb-3 flex-row items-center justify-between">
        <ShimmerBase height={10} width="45%" borderRadius={5} />
        <ShimmerBase height={32} width={32} borderRadius={8} />
      </View>
      <ShimmerBase height={24} width="55%" borderRadius={6} />
    </View>
  );
}

export function ShimmerMealRow({ className }: { className?: string }) {
  return (
    <View className={cn("border-b border-border py-4 gap-3", className)}>
      <View className="flex-row items-center gap-3">
        <ShimmerAvatar size={40} />
        <View className="flex-1 gap-2">
          <ShimmerBase height={14} width="55%" borderRadius={6} />
          <ShimmerBase height={10} width="30%" borderRadius={5} />
        </View>
        <ShimmerBase height={24} width={64} borderRadius={12} />
      </View>
      <View className="flex-row justify-between px-2">
        <ShimmerBase height={48} width={64} borderRadius={12} />
        <ShimmerBase height={48} width={64} borderRadius={12} />
        <ShimmerBase height={48} width={64} borderRadius={12} />
      </View>
    </View>
  );
}
