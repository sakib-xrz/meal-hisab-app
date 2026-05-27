import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { cn } from "@/lib/utils/cn";

type InputProps = TextInputProps & {
  error?: string;
  containerClassName?: string;
  passwordToggle?: boolean;
};

export function Input({
  error,
  className,
  containerClassName,
  passwordToggle,
  secureTextEntry,
  editable,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isSecure = passwordToggle ? !showPassword : secureTextEntry;
  const isEditable = editable !== false;

  return (
    <View className={containerClassName}>
      <View className="relative">
        <TextInput
          className={cn(
            "min-h-12 rounded-lg border bg-surface px-4 py-3 font-sans text-base text-foreground shadow-sm shadow-foreground/5",
            error
              ? "border-danger"
              : focused
                ? "border-primary"
                : "border-border",
            !isEditable && "bg-surface-muted text-muted",
            passwordToggle && "pr-12",
            className
          )}
          placeholderTextColor="#8b9894"
          secureTextEntry={isSecure}
          editable={editable}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
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
      {error ? (
        <Text className="mt-1 font-sans text-sm text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
