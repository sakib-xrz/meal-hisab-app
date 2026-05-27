import { Text, type TextProps } from "react-native";

import { cn } from "@/lib/utils/cn";

export function Label({ children, className, ...props }: TextProps) {
  return (
    <Text
      className={cn("mb-2 font-sans text-sm font-semibold tracking-wide text-foreground-secondary", className)}
      {...props}
    >
      {children}
    </Text>
  );
}
