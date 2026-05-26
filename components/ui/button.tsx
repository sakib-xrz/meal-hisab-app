import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type TextProps,
} from "react-native";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: "#2563eb" },
  secondary: { backgroundColor: "#e5e7eb" },
  danger: { backgroundColor: "#dc2626" },
});

const textStyles = StyleSheet.create({
  primary: { color: "#ffffff" },
  secondary: { color: "#111827" },
  danger: { color: "#ffffff" },
});

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variantStyles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#111827" : "#ffffff"} />
      ) : (
        <Text style={[styles.buttonText, textStyles[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Label({ children, style, ...props }: TextProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});
