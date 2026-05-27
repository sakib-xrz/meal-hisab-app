import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useRef } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Brand, Shadows } from "@/constants/theme";

type BottomSheetModalVariant = "danger" | "primary" | "accent";

type BottomSheetModalProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: BottomSheetModalVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
};

const variantConfig: Record<
  BottomSheetModalVariant,
  {
    iconName: ComponentProps<typeof MaterialIcons>["name"];
    iconBg: string;
    iconColor: string;
    confirmVariant: "danger" | "primary";
  }
> = {
  danger: {
    iconName: "warning",
    iconBg: "#ffe8ee",
    iconColor: "#d9385e",
    confirmVariant: "danger",
  },
  primary: {
    iconName: "check-circle",
    iconBg: "#d8f7ee",
    iconColor: "#0b4f4a",
    confirmVariant: "primary",
  },
  accent: {
    iconName: "info",
    iconBg: "#fff3cf",
    iconColor: "#9a5b00",
    confirmVariant: "primary",
  },
};

export function useBottomSheetModal() {
  const ref = useRef<BottomSheet>(null);

  const open = useCallback(() => {
    ref.current?.snapToIndex(0);
  }, []);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  return { ref, open, close };
}

export function ConfirmSheet({
  sheetRef,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading,
  onConfirm,
  onCancel,
  children,
}: BottomSheetModalProps & { sheetRef: React.RefObject<BottomSheet | null> }) {
  const snapPoints = useMemo(() => ["40%"], []);
  const config = variantConfig[variant];

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
    sheetRef.current?.close();
  }, [onCancel, sheetRef]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
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
      <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
        {/* Icon */}
        <View className="mb-4 items-center">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: config.iconBg }}
          >
            <MaterialIcons name={config.iconName} size={28} color={config.iconColor} />
          </View>
        </View>

        {/* Title */}
        <Text className="mb-2 text-center font-sans text-xl font-bold text-foreground">
          {title}
        </Text>

        {/* Description */}
        {description ? (
          <Text className="mb-6 text-center font-sans text-base leading-6 text-muted">
            {description}
          </Text>
        ) : null}

        {children}

        {/* Actions */}
        <View className="mt-auto gap-3">
          <Button
            title={confirmLabel}
            variant={config.confirmVariant}
            size="lg"
            loading={loading}
            onPress={onConfirm}
          />
          <Button
            title={cancelLabel}
            variant="ghost"
            onPress={handleCancel}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
