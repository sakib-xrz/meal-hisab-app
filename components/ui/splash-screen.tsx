import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Brand } from "@/constants/theme";

export function AppSplashScreen() {
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);

  useEffect(() => {
    // Logo entrance
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // Glow pulse
    glowOpacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    glowScale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    // Dot loading animation
    dotOpacity1.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
      ),
    );
    dotOpacity2.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
      ),
    );
    dotOpacity3.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
        ),
        -1,
      ),
    );
  }, [logoScale, logoOpacity, glowScale, glowOpacity, dotOpacity1, dotOpacity2, dotOpacity3]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  return (
    <View className="absolute inset-0">
      <LinearGradient
        colors={[Brand.primaryDeep, Brand.primaryDark, Brand.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}
      >
        <View className="w-full max-w-[280px] items-center">
          {/* Glow ring */}
          <Animated.View
            style={[
              glowStyle,
              {
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: Brand.primaryGlow,
                top: -20,
              },
            ]}
          />

          {/* Logo container */}
          <Animated.View
            style={logoStyle}
            className="mb-6 h-[100px] w-[100px] items-center justify-center rounded-3xl bg-white/15"
          >
            <MaterialIcons name="restaurant-menu" size={52} color="#fffffc" />
          </Animated.View>

          {/* App name */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(500).springify()}
            className="text-center font-sans text-3xl font-bold text-white"
          >
            Meal Hisab
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text
            entering={FadeInDown.delay(500).duration(500).springify()}
            className="mt-2 text-center font-sans text-sm tracking-wider text-white/70"
          >
            Count every meal
          </Animated.Text>

          {/* Animated dots */}
          <Animated.View
            entering={FadeIn.delay(700).duration(400)}
            className="mt-10 flex-row items-center gap-2"
          >
            <Animated.View
              style={dot1Style}
              className="h-2 w-2 rounded-full bg-white"
            />
            <Animated.View
              style={dot2Style}
              className="h-2 w-2 rounded-full bg-white"
            />
            <Animated.View
              style={dot3Style}
              className="h-2 w-2 rounded-full bg-white"
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
