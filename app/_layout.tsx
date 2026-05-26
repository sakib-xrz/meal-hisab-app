import "react-native-gesture-handler";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import "../global.css";

import { AuthProvider, useAuth } from "@/context/auth-provider";
import { QueryProvider } from "@/context/query-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isLoading, token, messId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const group = segments[0];
    const inAuth = group === "(auth)";
    const inOnboarding = group === "(onboarding)";
    const inApp = group === "(app)";
    const onBootstrap = !group || !group.startsWith("(");

    if (!token && (onBootstrap || !inAuth)) {
      router.replace("/(auth)/login");
      return;
    }

    if (token && !messId && (onBootstrap || !inOnboarding)) {
      router.replace("/(onboarding)/create-mess");
      return;
    }

    if (token && messId && (onBootstrap || !inApp)) {
      router.replace("/(app)/(tabs)");
    }
  }, [isLoading, token, messId, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
});
