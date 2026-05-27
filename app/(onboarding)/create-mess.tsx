import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
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
import { useCreateMess } from "@/lib/queries/mess";

const schema = z.object({
  name: z.string().min(2, "Mess name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateMessScreen() {
  const { setMessIdState, signOut } = useAuth();
  const createMessMutation = useCreateMess();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", address: "", phone: "" },
  });

  const onSubmit = async (values: FormValues) => {
    createMessMutation.mutate(
      {
        name: values.name,
        address: values.address || undefined,
        phone: values.phone || undefined,
      },
      {
        onSuccess: async (mess) => {
          await setMessIdState(mess.id);
          Toast.show({ type: "success", text1: "Mess created" });
          router.replace("/(app)/(tabs)");
        },
        onError: (err) => {
          Toast.show({
            type: "error",
            text1: "Could not create mess",
            text2: err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  return (
    <Screen
      keyboardAvoid
      hero={<BrandHero subtitle="Set up your mess and start the monthly count" />}
    >
      <Card variant="glass" animated animationDelay={200} title="Mess details" subtitle="One mess per account">
        <View className="gap-5">
          <Animated.View entering={FadeInDown.delay(300).duration(400).springify()}>
            <Label>Mess name *</Label>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Bashundhara Bachelor Mess"
                  leftIcon="home"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
            <Label>Address</Label>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Optional"
                  leftIcon="location-on"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400).springify()}>
            <Label>Contact phone</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Optional"
                  keyboardType="phone-pad"
                  leftIcon="phone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).duration(400).springify()} className="gap-3">
            <Button
              title="Create Mess"
              leftIcon="add-business"
              size="lg"
              loading={createMessMutation.isPending}
              onPress={handleSubmit(onSubmit)}
            />
            <Button
              title="Sign out"
              leftIcon="logout"
              variant="ghost"
              onPress={async () => {
                await signOut();
                router.replace("/(auth)/login");
              }}
            />
          </Animated.View>
        </View>
      </Card>
    </Screen>
  );
}
