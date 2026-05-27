import { ActivityIndicator, Text, View } from "react-native";

import { BrandMark } from "@/components/ui/brand-mark";

export function AppSplashScreen() {
  return (
    <View className="absolute inset-0 items-center justify-center bg-primary-dark px-8">
      <View className="w-full max-w-[280px] items-center">
        <BrandMark size="xl" variant="light" />
        <Text className="mt-5 text-center font-sans text-3xl font-bold text-white">
          Meal Hisab
        </Text>
        <Text className="mt-2 text-center font-sans text-sm text-white/75">
          Count every meal
        </Text>
        <ActivityIndicator className="mt-8" color="#fffffc" />
      </View>
    </View>
  );
}
