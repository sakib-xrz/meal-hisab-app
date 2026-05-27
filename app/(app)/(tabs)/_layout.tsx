import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand, Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View style={{ borderRadius: 24, overflow: "hidden", ...StyleSheet.absoluteFillObject }}>
            <BlurView
              intensity={90}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 28 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 24,
          backgroundColor: colorScheme === "dark" ? "rgba(11, 22, 20, 0.65)" : "rgba(255, 255, 252, 0.65)",
          borderWidth: 1,
          borderColor: colorScheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(219, 229, 220, 0.55)",
          elevation: 8,
          shadowColor: "#16201f",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: colorScheme === "dark" ? 0.3 : 0.08,
          shadowRadius: 16,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 3,
        },
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans_500Medium",
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="fork.knife" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
