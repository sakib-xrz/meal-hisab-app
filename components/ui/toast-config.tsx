import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";
import type { ToastConfig } from "react-native-toast-message";

import { cn } from "@/lib/utils/cn";

function ToastBase({
  text1,
  text2,
  variant,
}: {
  text1?: string;
  text2?: string;
  variant: "success" | "error" | "info";
}) {
  const styles = {
    success: "border-primary/30 bg-surface",
    error: "border-danger/30 bg-surface",
    info: "border-accent/30 bg-surface",
  } as const;

  const iconConfig = {
    success: { name: "check-circle" as const, color: "#0f766e", bg: "bg-primary-soft" },
    error: { name: "error" as const, color: "#d9385e", bg: "bg-danger-soft" },
    info: { name: "info" as const, color: "#f3a83b", bg: "bg-accent-soft" },
  } as const;

  const titleColors = {
    success: "text-primary-dark",
    error: "text-danger",
    info: "text-amber-900",
  } as const;

  const icon = iconConfig[variant];

  return (
    <View
      className={cn(
        "mx-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-lg shadow-foreground/10",
        styles[variant],
      )}
    >
      <View className={cn("h-9 w-9 items-center justify-center rounded-xl", icon.bg)}>
        <MaterialIcons name={icon.name} size={20} color={icon.color} />
      </View>
      <View className="flex-1">
        {text1 ? (
          <Text className={cn("font-sans text-base font-semibold", titleColors[variant])}>
            {text1}
          </Text>
        ) : null}
        {text2 ? (
          <Text className="mt-0.5 font-sans text-sm text-muted" numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="success" />,
  error: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="error" />,
  info: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="info" />,
};
