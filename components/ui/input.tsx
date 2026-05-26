import { TextInput, Text, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/utils/cn";

type InputProps = TextInputProps & {
  error?: string;
  containerClassName?: string;
};

export function Input({
  error,
  className,
  containerClassName,
  ...props
}: InputProps) {
  return (
    <View className={containerClassName}>
      <TextInput
        className={cn(
          "rounded-xl border bg-surface px-4 py-3 font-sans text-base text-foreground",
          error ? "border-danger" : "border-border",
          className
        )}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? (
        <Text className="mt-1 font-sans text-sm text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
