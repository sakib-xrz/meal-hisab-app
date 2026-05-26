import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { resolveAssetUrl } from "@/lib/utils/assets";
import { cn } from "@/lib/utils/cn";

type AvatarProps = {
  name?: string | null;
  uri?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_PX = {
  sm: 40,
  md: 56,
  lg: 80,
} as const;

const textSizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
} as const;

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Avatar({ name, uri, size = "md", className }: AvatarProps) {
  const dimension = SIZE_PX[size];
  const resolvedUri = resolveAssetUrl(uri);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolvedUri]);

  const showImage = Boolean(resolvedUri) && !failed;

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-primary-soft",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      {showImage ? (
        <Image
          source={{ uri: resolvedUri! }}
          style={{ width: dimension, height: dimension }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={name ?? "Avatar"}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text className={cn("font-sans font-bold text-primary-dark", textSizeClasses[size])}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
