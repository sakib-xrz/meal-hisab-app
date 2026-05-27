import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { BrandHero } from "@/components/ui/brand-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await signIn(values.phone, values.password);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";

      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: message,
      });
    }
  };

  return (
    <Screen keyboardAvoid contentClassName="pt-4">
      <BrandHero
        compact
        className="mb-8"
        subtitle="Welcome back to your meal ledger"
      />

      <Card
        variant="glass"
        animated
        animationDelay={200}
        title="Sign in"
        subtitle="Access your mess dashboard"
      >
        <View className="gap-5">
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
          >
            <Label>Phone</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  leftIcon="phone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
          >
            <Label>Password</Label>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your password"
                  passwordToggle
                  secureTextEntry
                  leftIcon="lock"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
          >
            <Button
              title="Sign In"
              leftIcon="login"
              size="lg"
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(400)}
          >
            <Text className="text-center font-sans text-sm text-muted">
              No account?{" "}
              <Link
                href="/(auth)/register"
                className="font-semibold text-primary"
              >
                Register
              </Link>
            </Text>
          </Animated.View>
        </View>
      </Card>
    </Screen>
  );
}
