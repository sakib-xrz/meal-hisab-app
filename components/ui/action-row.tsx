import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { Pressable, Text, View, type PressableProps } from "react-native";

import { cn } from "@/lib/utils/cn";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type ActionRowProps = PressableProps & {
  title: string;
  subtitle?: string;
  icon?: MaterialIconName;
  right?: React.ReactNode;
  tone?: "primary" | "accent" | "danger" | "muted";
  className?: string;
};

const toneClasses = {
  primary: {
    icon: "bg-primary-soft",
    color: "#0b4f4a",
  },
  accent: {
    icon: "bg-accent-soft",
    color: "#9a5b00",
  },
  danger: {
    icon: "bg-danger-soft",
    color: "#d9385e",
  },
  muted: {
    icon: "bg-surface-muted",
    color: "#52605e",
  },
} as const;

export function ActionRow({
  title,
  subtitle,
  icon,
  right,
  tone = "primary",
  className,
  ...props
}: ActionRowProps) {
  const currentTone = toneClasses[tone];

  return (
    <Pressable
      className={cn(
        "flex-row items-center rounded-lg border border-border bg-surface px-3.5 py-3 shadow-sm shadow-foreground/5 active:opacity-80",
        className,
      )}
      accessibilityRole="button"
      {...props}
    >
      {icon ? (
        <View className={cn("mr-3 h-10 w-10 items-center justify-center rounded-md", currentTone.icon)}>
          <MaterialIcons name={icon} size={20} color={currentTone.color} />
        </View>
      ) : null}
      <View className="mr-3 flex-1">
        <Text className="font-sans text-base font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 font-sans text-sm text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <MaterialIcons name="chevron-right" size={22} color="#64706d" />}
    </Pressable>
  );
}
