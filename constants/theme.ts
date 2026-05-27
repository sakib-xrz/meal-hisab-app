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
  primaryDeep: "#084c44",
  primarySoft: "#d8f7ee",
  primaryGlow: "#34d399",
  accent: "#f3a83b",
  accentSoft: "#fff3cf",
  surface: "#fffffc",
  surfaceMuted: "#eef4ef",
  surfaceElevated: "#ffffff",
  background: "#f5f8f2",
  border: "#dbe5dc",
  text: "#16201f",
  muted: "#64706d",
  danger: "#d9385e",
  info: "#2563eb",
  // Gradients
  gradientStart: "#0b4f4a",
  gradientMid: "#0f766e",
  gradientEnd: "#14b8a6",
  // Glassmorphism
  glass: "rgba(255, 255, 252, 0.72)",
  glassStrong: "rgba(255, 255, 252, 0.88)",
  glassBorder: "rgba(219, 229, 220, 0.55)",
  glassDark: "rgba(11, 79, 74, 0.85)",
  glassDarkBorder: "rgba(52, 211, 153, 0.18)",
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#16201f",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#16201f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#16201f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: "#0f766e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  float: {
    shadowColor: "#16201f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
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
