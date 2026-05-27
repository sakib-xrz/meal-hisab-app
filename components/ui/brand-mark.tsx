import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type BrandMarkProps = {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "soft" | "light";
  className?: string;
  showText?: boolean;
};

const dimensions = {
  sm: 36,
  md: 48,
  lg: 64,
  xl: 92,
} as const;

const iconSizes = {
  sm: 19,
  md: 25,
  lg: 34,
  xl: 50,
} as const;

const tileClasses = {
  solid: "bg-primary-dark shadow-md shadow-primary-dark/20",
  soft: "border border-primary-soft bg-primary-soft",
  light: "bg-white/15",
} as const;

const iconColors = {
  solid: "#fffffc",
  soft: "#0b4f4a",
  light: "#fffffc",
} as const;

export function BrandMark({
  size = "md",
  variant = "solid",
  className,
  showText,
}: BrandMarkProps) {
  const dimension = dimensions[size];

  return (
    <View className={cn("flex-row items-center gap-3", className)}>
      <View
        className={cn(
          "items-center justify-center rounded-lg",
          tileClasses[variant],
        )}
        style={{ height: dimension, width: dimension }}
      >
        <MaterialIcons
          name="restaurant-menu"
          size={iconSizes[size]}
          color={iconColors[variant]}
        />
      </View>
      {showText ? (
        <View>
          <Text className="font-sans text-lg font-bold text-foreground">
            Meal Hisab
          </Text>
          <Text className="font-sans text-xs text-muted">Count every meal</Text>
        </View>
      ) : null}
    </View>
  );
}
