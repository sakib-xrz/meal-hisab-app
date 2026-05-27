import { Text, View } from "react-native";

import { BrandMark } from "@/components/ui/brand-mark";
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
      <View className={cn("items-center px-4 pb-2 pt-6", className)}>
        <BrandMark size="lg" variant="solid" className="mb-3" />
        <Text className="font-sans text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-center font-sans text-sm text-muted">{subtitle}</Text>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "mx-4 mb-8 mt-6 overflow-hidden rounded-xl bg-primary-dark px-5 py-6 shadow-lg shadow-primary-dark/20",
        className
      )}
    >
      <View className="mb-6 flex-row items-center justify-between self-stretch">
        <BrandMark size="lg" variant="light" />
        <View className="rounded-md bg-accent px-3 py-1.5">
          <Text className="font-sans text-xs font-bold text-foreground">Mess ready</Text>
        </View>
      </View>
      <Text className="self-stretch font-sans text-3xl font-bold text-white">
        {title}
      </Text>
      <Text className="mt-2 self-stretch font-sans text-base leading-6 text-white/80">
        {subtitle}
      </Text>
    </View>
  );
}
