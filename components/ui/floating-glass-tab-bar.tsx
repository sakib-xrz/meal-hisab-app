import {
  BottomTabBarHeightCallbackContext,
  type BottomTabBarButtonProps,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cn } from "@/lib/utils/cn";

export const TAB_BAR_HEIGHT = 58;
const TAB_BAR_SIDE_INSET = 18;
const TAB_BAR_BOTTOM_GAP = 10;

export function FloatingGlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const onHeightChange = React.useContext(BottomTabBarHeightCallbackContext);
  const palette = Colors[colorScheme ?? "light"];

  const bottomInset = Math.max(insets.bottom, TAB_BAR_BOTTOM_GAP);

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
      style={{ height: TAB_BAR_HEIGHT + bottomInset }}
      onLayout={(event) => {
        onHeightChange?.(event.nativeEvent.layout.height);
      }}
    >
      <View
        className={cn(
          "absolute overflow-hidden rounded-[28px] border shadow-xl shadow-foreground/15",
          isDark ? "border-glass-dark-border bg-glass-dark" : "border-glass-border bg-glass-strong",
        )}
        style={{
          left: TAB_BAR_SIDE_INSET,
          right: TAB_BAR_SIDE_INSET,
          bottom: bottomInset,
          height: TAB_BAR_HEIGHT,
        }}
      >
        <View
          className={cn(
            "absolute inset-0",
            isDark ? "bg-[rgba(11,22,20,0.12)]" : "bg-[rgba(255,255,252,0.35)]",
          )}
          pointerEvents="none"
        />

        <LinearGradient
          colors={
            isDark
              ? ["rgba(52, 211, 153, 0.12)", "transparent"]
              : ["rgba(255, 255, 255, 0.75)", "transparent"]
          }
          className="absolute left-0 right-0 top-0 h-[55%]"
        />

        <View className="flex-1 flex-row items-stretch pt-1">
          {state.routes.map((route, index) => {
            const focused = index === state.index;
            const { options } = descriptors[route.key];
            const color = focused
              ? palette.tabIconSelected
              : palette.tabIconDefault;
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : (options.title ?? route.name);

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate(route),
                  target: state.key,
                });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            const TabButton = options.tabBarButton ?? DefaultTabButton;

            return (
              <TabButton
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                className="flex-1 items-center justify-center"
              >
                {options.tabBarIcon?.({
                  focused,
                  color,
                  size: 22,
                })}
                <Text
                  className="font-sans text-[10px] font-medium"
                  style={{ color }}
                >
                  {label}
                </Text>
              </TabButton>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function DefaultTabButton(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} />;
}
