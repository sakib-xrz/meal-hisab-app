import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type ListRowProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  className?: string;
};

export function ListRow({
  title,
  subtitle,
  right,
  onPress,
  destructive,
  showChevron,
  className,
}: ListRowProps) {
  const content = (
    <View className={cn("flex-row items-center justify-between py-3.5", className)}>
      <View className="mr-3 flex-1">
        <Text
          className={cn(
            "font-sans text-base font-medium",
            destructive ? "text-danger" : "text-foreground"
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-sans text-sm text-muted">{subtitle}</Text>
        ) : null}
      </View>
      {right}
      {showChevron ? (
        <MaterialIcons name="chevron-right" size={22} color="#64706d" />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-70"
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
