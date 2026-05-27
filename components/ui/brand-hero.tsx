import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { BrandMark } from "@/components/ui/brand-mark";
import { Brand } from "@/constants/theme";
import { cn } from "@/lib/utils/cn";

type BrandHeroProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
  className?: string;
};

export function BrandHero({
  title = "Meal Hisab",
  subtitle = "Mess meal tracking made simple",
  compact,
  className,
}: BrandHeroProps) {
  if (compact) {
    return (
      <Animated.View
        entering={FadeIn.duration(500)}
        className={cn("items-center px-4 pb-2 pt-8", className)}
      >
        <BrandMark size="lg" variant="gradient" className="mb-4" />
        <Text className="font-sans text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-center font-sans text-sm text-muted">{subtitle}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify().damping(18)}
      className={cn("mx-4 mb-8 mt-6 overflow-hidden rounded-2xl shadow-lg shadow-primary-dark/20", className)}
    >
      <LinearGradient
        colors={[Brand.primaryDeep, Brand.primaryDark, Brand.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingVertical: 24 }}
      >
        <View className="mb-6 flex-row items-center justify-between self-stretch">
          <BrandMark size="lg" variant="light" />
          <View className="rounded-full bg-accent px-3.5 py-1.5">
            <Text className="font-sans text-xs font-bold text-foreground">Mess ready</Text>
          </View>
        </View>
        <Text className="self-stretch font-sans text-3xl font-bold text-white">
          {title}
        </Text>
        <Text className="mt-2 self-stretch font-sans text-base leading-6 text-white/75">
          {subtitle}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}
