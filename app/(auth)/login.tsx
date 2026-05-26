import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

import { Button, Label } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      // Root layout auth guard handles redirect.
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
    <Screen title="Meal Hisab" subtitle="Sign in to your account" keyboardAvoid>
      <View style={styles.form}>
        <View style={styles.field}>
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

        <View style={styles.field}>
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

        <Button
          title="Sign In"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />

        <Text style={styles.footer}>
          No account?{" "}
          <Link href="/(auth)/register" style={styles.link}>
            Register
          </Link>
        </Text>

        {__DEV__ ? (
          <Text style={styles.apiHint}>API: {getApiBaseUrlForDisplay()}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    marginTop: 16,
  },
  field: {
    gap: 4,
  },
  footer: {
    textAlign: "center",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
  apiHint: {
    marginTop: 12,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 12,
  },
});
