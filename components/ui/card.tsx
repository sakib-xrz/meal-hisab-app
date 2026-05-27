import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils/cn";

type CardProps = ViewProps & {
  title?: string;
  subtitle?: string;
  className?: string;
};

export function Card({
  title,
  subtitle,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={cn(
        "rounded-lg border border-border bg-surface p-4 shadow-sm shadow-foreground/5",
        className
      )}
      {...props}
    >
      {title ? (
        <Text className="mb-1 font-sans text-lg font-bold text-foreground">
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mb-3 font-sans text-sm text-muted">{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}
