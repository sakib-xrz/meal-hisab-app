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
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = passwordToggle ? !showPassword : secureTextEntry;

  return (
    <View className={containerClassName}>
      <View className="relative">
        <TextInput
          className={cn(
            "rounded-xl border bg-surface px-4 py-3 font-sans text-base text-foreground",
            error ? "border-danger" : "border-border",
            passwordToggle && "pr-12",
            className
          )}
          placeholderTextColor="#94a3b8"
          secureTextEntry={isSecure}
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
              color="#94a3b8"
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
