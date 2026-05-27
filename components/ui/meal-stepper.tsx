import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

export type MealStepValue = 0 | 1;

export function toMealStepValue(value: number): MealStepValue {
  const n = Number(value);
  return n > 0 ? 1 : 0;
}

type MealStepperProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function MealStepper({
  value,
  onChange,
  disabled,
  label,
  className,
}: MealStepperProps) {
  const current = toMealStepValue(value);

  const toggle = () => {
    onChange(current === 0 ? 1 : 0);
  };

  return (
    <View className={cn("items-center", className)}>
      {label ? (
        <Text className="mb-1.5 font-sans text-xs font-semibold text-muted">{label}</Text>
      ) : null}
      <Pressable
        onPress={disabled ? undefined : toggle}
        className={cn(
          "h-12 w-16 flex-row items-center justify-center rounded-lg border",
          disabled
            ? "border-border bg-surface-muted opacity-60"
            : current > 0
              ? "border-primary bg-primary-soft"
              : "border-border bg-surface active:bg-surface-muted"
        )}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label} meal count ${current}` : `Meal count ${current}`}
      >
        <MaterialIcons
          name={current > 0 ? "check" : "add"}
          size={16}
          color={current > 0 ? "#0b4f4a" : "#64706d"}
        />
        <Text
          className={cn(
            "ml-1 font-sans text-lg font-bold",
            current > 0 ? "text-primary-dark" : "text-foreground"
          )}
        >
          {current}
        </Text>
      </Pressable>
    </View>
  );
}

export const MEAL_OPTIONS = [0, 1] as const;
