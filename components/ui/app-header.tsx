import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
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

  return (
    <View
      className={cn("border-b border-border bg-background px-4 pb-3", className)}
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          {showBack ? (
            <Pressable
              onPress={handleBack}
              className="mr-3 h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface active:bg-surface-muted"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialIcons name="arrow-back-ios-new" size={18} color="#16201f" />
            </Pressable>
          ) : null}
          <View className="flex-1">
            <Text className="font-sans text-xl font-bold text-foreground" numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="font-sans text-sm text-muted" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}

export function stackHeaderOptions(title: string) {
  return {
    headerShown: true,
    header: () => <AppHeader title={title} />,
  } as const;
}
