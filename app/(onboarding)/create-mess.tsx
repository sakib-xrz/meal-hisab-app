import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
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
import { QRProfileCard } from "@/components/ui/qr-profile-card";
import { Screen } from "@/components/ui/screen";
import { SegmentControl } from "@/components/ui/segment-control";
import { useAuth } from "@/context/auth-provider";
import { ApiError } from "@/lib/api/client";
import { useCreateMess } from "@/lib/queries/mess";

const schema = z.object({
  name: z.string().min(2, "Mess name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type OnboardingTab = "create" | "share";

const TAB_OPTIONS: { value: OnboardingTab; label: string }[] = [
  { value: "create", label: "Create mess" },
  { value: "share", label: "Share profile" },
];

export default function CreateMessScreen() {
  const [tab, setTab] = useState<OnboardingTab>("create");
  const { user, setMessIdState, signOut } = useAuth();
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
            text2:
              err instanceof ApiError ? err.message : "Something went wrong",
          });
        },
      },
    );
  };

  return (
    <Screen
      keyboardAvoid
      hero={
        <BrandHero
          subtitle="Set up your mess and start the monthly count"
          compact
        />
      }
    >
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="mb-5"
      >
        <SegmentControl
          options={TAB_OPTIONS}
          value={tab}
          onChange={setTab}
          variant="glass"
        />
      </Animated.View>

      {tab === "create" ? (
        <Card
          variant="glass"
          animated
          animationDelay={300}
          title="Mess details"
          subtitle="Set up a new mess to start tracking meals"
        >
          <View className="gap-5">
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Label>Mess name *</Label>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Enter mess name"
                    leftIcon="home"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Label>Address (Optional)</Label>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Enter mess address"
                    leftIcon="location-on"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).duration(400)}>
              <Label>Contact Number (Optional)</Label>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Enter contact number"
                    keyboardType="phone-pad"
                    leftIcon="phone"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(700).duration(400)}
              className="gap-3"
            >
              <Button
                title="Create Mess"
                leftIcon="add-business"
                size="lg"
                loading={createMessMutation.isPending}
                onPress={handleSubmit(onSubmit)}
              />
            </Animated.View>
          </View>
        </Card>
      ) : user ? (
        <Card
          variant="glass"
          animated
          animationDelay={300}
          title="Share your profile"
          subtitle="Let a mess owner scan your QR to add you"
        >
          <QRProfileCard name={user.name} phone={user.phone} />
        </Card>
      ) : null}

      <Animated.View
        entering={FadeInDown.delay(800).duration(400)}
        className="mt-4"
      >
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
    </Screen>
  );
}
