import { Text, View } from "react-native";
import type { ToastConfig } from "react-native-toast-message";

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
    success: "border-primary bg-primary-soft",
    error: "border-danger bg-danger-soft",
    info: "border-accent bg-accent-soft",
  } as const;

  const titleColors = {
    success: "text-primary-dark",
    error: "text-danger",
    info: "text-amber-900",
  } as const;

  return (
    <View className={`mx-4 rounded-2xl border px-4 py-3 shadow-lg shadow-black/10 ${styles[variant]}`}>
      {text1 ? (
        <Text className={`font-sans text-base font-semibold ${titleColors[variant]}`}>{text1}</Text>
      ) : null}
      {text2 ? <Text className="mt-1 font-sans text-sm text-foreground-secondary">{text2}</Text> : null}
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="success" />,
  error: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="error" />,
  info: ({ text1, text2 }) => <ToastBase text1={text1} text2={text2} variant="info" />,
};
