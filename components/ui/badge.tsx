import { Text, View } from "react-native";

import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "accent" | "danger" | "muted";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const containerClasses: Record<BadgeVariant, string> = {
  default: "bg-surface-muted",
  primary: "bg-primary-soft",
  accent: "bg-accent-soft",
  danger: "bg-danger-soft",
  muted: "bg-surface-muted",
};

const textClasses: Record<BadgeVariant, string> = {
  default: "text-foreground-secondary",
  primary: "text-primary-dark",
  accent: "text-amber-700",
  danger: "text-danger",
  muted: "text-muted",
};

export function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <View
      className={cn("self-start rounded-md px-2.5 py-1", containerClasses[variant], className)}
    >
      <Text
        className={cn(
          "font-sans text-xs font-semibold",
          textClasses[variant]
        )}
      >
        {label}
      </Text>
    </View>
  );
}
