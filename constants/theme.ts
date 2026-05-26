import { Platform } from "react-native";

const tintColorLight = "#0d9488";
const tintColorDark = "#5eead4";

export const Colors = {
  light: {
    text: "#0f172a",
    background: "#f8fafc",
    tint: tintColorLight,
    icon: "#64748b",
    tabIconDefault: "#94a3b8",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#f8fafc",
    background: "#0f172a",
    tint: tintColorDark,
    icon: "#94a3b8",
    tabIconDefault: "#64748b",
    tabIconSelected: tintColorDark,
  },
};

export const Brand = {
  primary: "#0d9488",
  primarySoft: "#ccfbf1",
  accent: "#f59e0b",
  surface: "#ffffff",
  background: "#f8fafc",
  danger: "#e11d48",
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "PlusJakartaSans_400Regular",
    sansMedium: "PlusJakartaSans_500Medium",
    sansSemiBold: "PlusJakartaSans_600SemiBold",
    sansBold: "PlusJakartaSans_700Bold",
  },
  default: {
    sans: "PlusJakartaSans_400Regular",
    sansMedium: "PlusJakartaSans_500Medium",
    sansSemiBold: "PlusJakartaSans_600SemiBold",
    sansBold: "PlusJakartaSans_700Bold",
  },
  web: {
    sans: "PlusJakartaSans_400Regular",
    sansMedium: "PlusJakartaSans_500Medium",
    sansSemiBold: "PlusJakartaSans_600SemiBold",
    sansBold: "PlusJakartaSans_700Bold",
  },
});
