import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils/cn";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type MetricTone = "primary" | "accent" | "info" | "danger" | "muted";

type MetricTileProps = ViewProps & {
  label: string;
  value: string;
  icon?: MaterialIconName;
  tone?: MetricTone;
  className?: string;
};

const toneClasses: Record<MetricTone, { tile: string; icon: string; iconColor: string }> = {
  primary: {
    tile: "border-primary-soft bg-primary-soft/55",
    icon: "bg-primary",
    iconColor: "#fffffc",
  },
  accent: {
    tile: "border-accent-soft bg-accent-soft/70",
    icon: "bg-accent",
    iconColor: "#16201f",
  },
  info: {
    tile: "border-info-soft bg-info-soft/70",
    icon: "bg-info",
    iconColor: "#fffffc",
  },
  danger: {
    tile: "border-danger-soft bg-danger-soft/65",
    icon: "bg-danger",
    iconColor: "#fffffc",
  },
  muted: {
    tile: "border-border bg-surface-muted/80",
    icon: "bg-foreground-secondary",
    iconColor: "#fffffc",
  },
};

export function MetricTile({
  label,
  value,
  icon,
  tone = "primary",
  className,
  ...props
}: MetricTileProps) {
  const classes = toneClasses[tone];

  return (
    <View
      className={cn(
        "rounded-lg border p-3 shadow-sm shadow-foreground/5",
        classes.tile,
        className,
      )}
      {...props}
    >
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-sans text-xs font-semibold text-foreground-secondary">
          {label}
        </Text>
        {icon ? (
          <View className={cn("h-8 w-8 items-center justify-center rounded-md", classes.icon)}>
            <MaterialIcons name={icon} size={17} color={classes.iconColor} />
          </View>
        ) : null}
      </View>
      <Text className="font-sans text-2xl font-bold text-foreground" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
