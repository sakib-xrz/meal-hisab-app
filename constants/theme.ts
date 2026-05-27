import { Platform } from "react-native";

const tintColorLight = "#0f766e";
const tintColorDark = "#7ddfc8";

export const Colors = {
  light: {
    text: "#16201f",
    background: "#f5f8f2",
    tint: tintColorLight,
    icon: "#64706d",
    tabIconDefault: "#8b9894",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#f5f8f2",
    background: "#0b1614",
    tint: tintColorDark,
    icon: "#9cafaa",
    tabIconDefault: "#64706d",
    tabIconSelected: tintColorDark,
  },
};

export const Brand = {
  primary: "#0f766e",
  primaryDark: "#0b4f4a",
  primarySoft: "#d8f7ee",
  accent: "#f3a83b",
  accentSoft: "#fff3cf",
  surface: "#fffffc",
  surfaceMuted: "#eef4ef",
  background: "#f5f8f2",
  border: "#dbe5dc",
  text: "#16201f",
  muted: "#64706d",
  danger: "#d9385e",
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
