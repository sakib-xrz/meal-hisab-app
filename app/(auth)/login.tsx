import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { BrandHero } from "@/components/ui/brand-hero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import { getApiBaseUrlForDisplay } from "@/lib/api/config";

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
    <Screen keyboardAvoid contentClassName="pt-0">
      <BrandHero compact className="mb-4" />
      <Card title="Sign in" subtitle="Welcome back to your mess">
        <View className="gap-4">
          <View>
            <Label>Phone</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="017XXXXXXXX"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />
          </View>

          <View>
            <Label>Password</Label>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Button title="Sign In" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

          <Text className="text-center font-sans text-sm text-muted">
            No account?{" "}
            <Link href="/(auth)/register" className="font-semibold text-primary">
              Register
            </Link>
          </Text>

          {__DEV__ ? (
            <Text className="text-center font-sans text-xs text-muted">
              API: {getApiBaseUrlForDisplay()}
            </Text>
          ) : null}
        </View>
      </Card>
    </Screen>
  );
}
