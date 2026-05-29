import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Sharing from "expo-sharing";
import { useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { captureRef } from "react-native-view-shot";

import { Button } from "@/components/ui/button";
import { Brand } from "@/constants/theme";

const QR_SIZE = 180;

type QRProfileCardProps = {
  name: string;
  phone: string;
};

export function QRProfileCard({ name, phone }: QRProfileCardProps) {
  const qrRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const qrData = JSON.stringify({
    app: "meal-hisab",
    name,
    phone,
  });

  const handleShare = useCallback(async () => {
    if (!qrRef.current) return;

    setSharing(true);
    try {
      const uri = await captureRef(qrRef, {
        format: "png",
        quality: 1,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your Meal Hisab QR",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Sharing not available on this device",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Could not share QR code",
        text2: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSharing(false);
    }
  }, []);

  return (
    <Animated.View entering={FadeInDown.delay(500).duration(400)}>
      {/* QR Code Area */}
      <View className="items-center rounded-2xl bg-white p-5">
        {/* User info */}
        <View className="mb-4 items-center">
          <View
            className="mb-2 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: Brand.primarySoft }}
          >
            <MaterialIcons name="person" size={22} color={Brand.primary} />
          </View>
          <Text className="font-sans text-base font-semibold text-foreground">
            {name}
          </Text>
          <Text className="font-sans text-sm text-muted">{phone}</Text>
        </View>

        {/* QR */}
        <View
          ref={qrRef}
          collapsable={false}
          className="items-center justify-center rounded-lg border border-border p-4"
          style={{ backgroundColor: "#ffffff" }}
        >
          <QRCode
            value={qrData}
            size={QR_SIZE}
            color={Brand.primaryDeep}
            backgroundColor="#ffffff"
          />
        </View>

        {/* Label */}
        <Text className="mt-3 font-sans text-xs text-muted">
          Scan to add this member to your mess
        </Text>
      </View>

      {/* Share button */}
      <Button
        title="Share QR Code"
        leftIcon="share"
        variant="secondary"
        loading={sharing}
        onPress={handleShare}
        className="mt-3"
      />
    </Animated.View>
  );
}
