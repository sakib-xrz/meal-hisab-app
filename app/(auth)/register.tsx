import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button, Label } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      // Root layout auth guard handles redirect.
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err instanceof ApiError ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <Screen title="Create account" subtitle="Register to get started" keyboardAvoid>
      <View className="gap-4 mt-4">
        <View>
          <Label>Full name</Label>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Your name"
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
                placeholder="At least 6 characters"
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

        <Text className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/(auth)/login" className="text-blue-600 font-semibold">
            Sign in
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
