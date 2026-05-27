import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/utils/cn";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type InputProps = TextInputProps & {
  error?: string;
  containerClassName?: string;
  passwordToggle?: boolean;
  leftIcon?: MaterialIconName;
};

export function Input({
  error,
  className,
  containerClassName,
  passwordToggle,
  secureTextEntry,
  editable,
  leftIcon,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isSecure = passwordToggle ? !showPassword : secureTextEntry;
  const isEditable = editable !== false;

  const borderProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderProgress.value > 0.5 ? "#0f766e" : error ? "#d9385e" : "#dbe5dc",
  }));

  return (
    <View className={containerClassName}>
      <Animated.View
        style={animatedBorderStyle}
        className="relative overflow-hidden rounded-xl border"
      >
        <View className="flex-row items-center">
          {leftIcon ? (
            <View className="pl-4">
              <MaterialIcons
                name={leftIcon}
                size={20}
                color={focused ? "#0f766e" : "#8b9894"}
              />
            </View>
          ) : null}
          <TextInput
            className={cn(
              "min-h-[52px] flex-1 bg-surface px-4 py-3.5 font-sans text-base text-foreground",
              !isEditable && "bg-surface-muted text-muted",
              passwordToggle && "pr-12",
              leftIcon && "pl-2.5",
              className,
            )}
            placeholderTextColor="#8b9894"
            secureTextEntry={isSecure}
            editable={editable}
            onFocus={(event) => {
              setFocused(true);
              borderProgress.value = withTiming(1, { duration: 200 });
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              borderProgress.value = withTiming(0, { duration: 200 });
              onBlur?.(event);
            }}
            {...props}
          />
          {passwordToggle ? (
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              className="absolute bottom-0 right-0 top-0 justify-center px-4"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={22}
                color={focused ? "#0f766e" : "#8b9894"}
              />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
      {error ? (
        <Text className="mt-1.5 font-sans text-sm text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
