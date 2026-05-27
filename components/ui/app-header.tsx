import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils/cn";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  className?: string;
};

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const content = (
    <View
      className={cn("border-b border-border/50 px-4 pb-3.5", className)}
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="mr-3 flex-1 flex-row items-center">
          {showBack ? (
            <Pressable
              onPress={handleBack}
              className="mr-3 h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface active:bg-surface-muted"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back-ios-new" size={17} color="#16201f" />
            </Pressable>
          ) : null}
          <View className="flex-1">
            <Text className="font-sans text-xl font-bold text-foreground" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-0.5 font-sans text-sm text-muted" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right}
      </View>
    </View>
  );

  // Wrap with BlurView on iOS for frosted effect
  if (Platform.OS === "ios") {
    return (
      <BlurView intensity={80} tint="extraLight" style={{ overflow: "hidden" }}>
        {content}
      </BlurView>
    );
  }

  return (
    <View className="bg-background">
      {content}
    </View>
  );
}

export function stackHeaderOptions(title: string) {
  return {
    headerShown: true,
    header: () => <AppHeader title={title} />,
  } as const;
}
