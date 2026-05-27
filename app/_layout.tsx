import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

import { AppSplashScreen } from "@/components/ui/splash-screen";
import { toastConfig } from "@/components/ui/toast-config";
import { Brand } from "@/constants/theme";
import { AuthProvider, useAuth } from "@/context/auth-provider";
import { QueryProvider } from "@/context/query-provider";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();
  const { isLoading, token, messId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const appReady = fontsLoaded && !isLoading;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  useEffect(() => {
    if (!appReady) return;

    const group = segments[0];
    const authScreen = segments[1];
    const inAuth = group === "(auth)";
    const inOnboarding = group === "(onboarding)";
    const inApp = group === "(app)";
    const onBootstrap = !group || !group.startsWith("(");

    if (!token) {
      if (!inAuth || (authScreen !== "login" && authScreen !== "register")) {
        router.replace("/(auth)/login");
      }
      return;
    }

    if (token && !messId && (onBootstrap || !inOnboarding)) {
      router.replace("/(onboarding)/create-mess");
      return;
    }

    if (token && messId && (onBootstrap || !inApp)) {
      router.replace("/(app)/(tabs)");
    }
  }, [appReady, isLoading, token, messId, segments, router]);

  return (
    <ThemeProvider
      value={{
        ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
        colors: {
          ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
          primary: Brand.primary,
          background: Brand.background,
          card: Brand.surface,
          border: Brand.border,
          text: Brand.text,
        },
      }}
    >
      <View className="flex-1 bg-background">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1, backgroundColor: Brand.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
        </Stack>

        {!appReady ? <AppSplashScreen /> : null}
      </View>
      <StatusBar style="dark" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <QueryProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
