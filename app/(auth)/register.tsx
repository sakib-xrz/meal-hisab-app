import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await signUp(values.name, values.phone, values.password);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <Screen keyboardAvoid contentClassName="pt-0">
      <BrandHero compact className="mb-4" />
      <Card title="Create account" subtitle="Register to get started">
        <View className="gap-4">
          <View>
            <Label>Full name</Label>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
          </View>

          <View>
            <Label>Phone</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your phone number"
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
                  placeholder="Enter your password"
                  passwordToggle
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Button
            title="Register"
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <Text className="text-center font-sans text-sm text-muted">
            Already have an account?{" "}
            <Link href="/(auth)/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
