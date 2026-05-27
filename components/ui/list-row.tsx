import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);



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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View className={cn("flex-row items-center justify-between py-3.5", className)}>
      <View className="mr-3 flex-1">
        <Text
          className={cn(
            "font-sans text-base font-medium",
            destructive ? "text-danger" : "text-foreground",
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
        <MaterialIcons name="chevron-right" size={22} color="#8b9894" />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={() => {
            scale.value = withTiming(0.98, { duration: 100 });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 100 });
          }}
          accessibilityRole="button"
        >
          {content}
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return content;
}
