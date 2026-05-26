import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
};

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className,
  disabled,
}: SegmentControlProps<T>) {
  return (
    <View
      className={cn(
        "flex-row rounded-xl border border-border bg-slate-100 p-1",
        className
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            className={cn(
              "flex-1 items-center rounded-lg px-3 py-2",
              selected && "bg-surface shadow-sm shadow-black/5",
              disabled && "opacity-50"
            )}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              className={cn(
                "font-sans text-sm font-medium",
                selected ? "text-primary" : "text-muted"
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
