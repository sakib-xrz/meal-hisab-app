import { Text, View } from "react-native";

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
      <View className={cn("items-center px-4 pt-6 pb-2", className)}>
        <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
          <Text className="text-2xl">🍽️</Text>
        </View>
        <Text className="font-sans text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-center font-sans text-sm text-muted">{subtitle}</Text>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "mx-4 mb-8 mt-6 items-center rounded-[20px] bg-primary px-6 py-10",
        className
      )}
    >
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
        <Text className="text-4xl">🍽️</Text>
      </View>
      <Text className="font-sans text-3xl font-bold text-white">{title}</Text>
      <Text className="mt-2 text-center font-sans text-base text-white/85">{subtitle}</Text>
    </View>
  );
}
