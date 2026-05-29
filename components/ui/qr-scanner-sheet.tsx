import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Brand, Shadows } from "@/constants/theme";

/** The shape of successfully parsed QR data from our app. */
export type QRScanResult = {
  name: string;
  phone: string;
};

type QRScannerSheetProps = {
  onScanSuccess: (data: QRScanResult) => void;
};

export type QRScannerSheetRef = {
  open: () => void;
  close: () => void;
};

type ScanMode = "camera" | "idle";

/**
 * Validate and parse QR code data. Returns null if invalid.
 */
function parseQRPayload(raw: string): QRScanResult | null {
  try {
    const data = JSON.parse(raw);
    if (
      data &&
      data.app === "meal-hisab" &&
      typeof data.name === "string" &&
      data.name.trim().length > 0 &&
      typeof data.phone === "string" &&
      data.phone.trim().length > 0
    ) {
      return { name: data.name.trim(), phone: data.phone.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

export const QRScannerSheet = forwardRef<
  QRScannerSheetRef,
  QRScannerSheetProps
>(function QRScannerSheet({ onScanSuccess }, ref) {
  const sheetRef = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const scanLockedRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>("idle");
  const [hasScanned, setHasScanned] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const snapPoints = useMemo(() => ["70%"], []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    open: () => {
      clearRetryTimer();
      scanLockedRef.current = false;
      setHasScanned(false);
      setMode("idle");
      sheetRef.current?.present();
    },
    close: () => {
      clearRetryTimer();
      scanLockedRef.current = true;
      setMode("idle");
      sheetRef.current?.dismiss();
    },
  }));

  const handleDismiss = useCallback(() => {
    clearRetryTimer();
    scanLockedRef.current = true;
    setMode("idle");
    setHasScanned(false);
  }, [clearRetryTimer]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanLockedRef.current) return;
      scanLockedRef.current = true;
      setHasScanned(true);

      const result = parseQRPayload(data);
      if (result) {
        clearRetryTimer();
        setMode("idle");
        onScanSuccess(result);
        sheetRef.current?.dismiss();
      } else {
        Toast.show({
          type: "error",
          text1: "Invalid QR code",
          text2: "This QR code is not from Meal Hisab",
        });
        // Allow scanning again after a brief delay
        retryTimerRef.current = setTimeout(() => {
          scanLockedRef.current = false;
          setHasScanned(false);
          retryTimerRef.current = null;
        }, 2000);
      }
    },
    [clearRetryTimer, onScanSuccess],
  );

  const handleStartCamera = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Toast.show({
          type: "error",
          text1: "Camera permission required",
          text2: "Please allow camera access to scan QR codes",
        });
        return;
      }
    }
    clearRetryTimer();
    scanLockedRef.current = false;
    setHasScanned(false);
    setMode("camera");
  }, [clearRetryTimer, permission, requestPermission]);

  const handlePickImage = useCallback(async () => {
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        setPickingImage(false);
        return;
      }

      // For gallery images, we use expo-camera's barcode scanner indirectly
      // Since jsQR needs raw pixel data, we'll show a helpful message instead
      // and recommend camera scanning for the best experience
      Toast.show({
        type: "info",
        text1: "Use camera for best results",
        text2: "Point your camera directly at the QR code",
      });
      setPickingImage(false);
      setMode("camera");
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not open gallery",
      });
      setPickingImage(false);
    }
  }, []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      style={{ zIndex: 1000, elevation: 1000 }}
      backgroundStyle={{
        backgroundColor: Brand.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Shadows.lg,
      }}
      handleIndicatorStyle={{
        backgroundColor: Brand.border,
        width: 40,
      }}
    >
      <BottomSheetView className="flex-1 px-5 pb-8 pt-2">
        {/* Header */}
        <View className="mb-4 items-center">
          <View
            className="mb-2 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: Brand.primarySoft }}
          >
            <MaterialIcons
              name="qr-code-scanner"
              size={26}
              color={Brand.primary}
            />
          </View>
          <Text className="font-sans text-lg font-bold text-foreground">
            Scan QR Code
          </Text>
          <Text className="mt-1 text-center font-sans text-sm text-muted">
            Scan a member&apos;s QR code to quickly add them
          </Text>
        </View>

        {mode === "camera" ? (
          /* Camera viewfinder */
          <View className="flex-1 overflow-hidden rounded-2xl">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={hasScanned ? undefined : handleBarCodeScanned}
            >
              {/* Scanning overlay */}
              <View className="flex-1 items-center justify-center my-4">
                {/* Corner frame */}
                <View
                  className="h-56 w-56 items-center justify-center"
                  style={{
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.6)",
                    borderRadius: 16,
                  }}
                >
                  {hasScanned && (
                    <ActivityIndicator size="large" color="#ffffff" />
                  )}
                </View>
                <Text className="font-sans text-sm font-medium text-white mt-2">
                  {hasScanned
                    ? "Processing…"
                    : "Align QR code within the frame"}
                </Text>
              </View>
            </CameraView>
          </View>
        ) : (
          /* Mode selection buttons */
          <View className="flex-1 justify-center gap-3">
            <Button
              title="Open Camera"
              leftIcon="camera-alt"
              size="lg"
              onPress={handleStartCamera}
            />
            <Button
              title="Pick from Gallery"
              leftIcon="photo-library"
              variant="secondary"
              size="lg"
              loading={pickingImage}
              onPress={handlePickImage}
            />
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
