import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "accent" | "danger" | "muted" | "success";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: ComponentProps<typeof MaterialIcons>["name"];
  pill?: boolean;
  className?: string;
};

const containerClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-muted",
  primary: "bg-primary-soft",
  accent: "bg-accent-soft",
  danger: "bg-danger-soft",
  muted: "bg-surface-muted",
  success: "bg-primary-soft",
};

const textClasses: Record<BadgeVariant, string> = {
  default: "text-foreground-secondary",
  primary: "text-primary-dark",
  accent: "text-amber-700",
  danger: "text-danger",
  muted: "text-muted",
  success: "text-primary-dark",
};

const iconColors: Record<BadgeVariant, string> = {
  default: "#52605e",
  primary: "#0b4f4a",
  accent: "#9a5b00",
  danger: "#d9385e",
  muted: "#64706d",
  success: "#0b4f4a",
};

export function Badge({ label, variant = "default", icon, pill, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center self-start px-2.5 py-1",
        pill ? "rounded-full" : "rounded-lg",
        containerClasses[variant],
        className,
      )}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={12}
          color={iconColors[variant]}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text
        className={cn(
          "font-sans text-xs font-semibold",
          textClasses[variant],
        )}
      >
        {label}
      </Text>
    </View>
  );
}
