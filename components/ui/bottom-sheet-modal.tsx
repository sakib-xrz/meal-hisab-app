import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { ComponentProps, ComponentRef } from "react";
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

type BottomSheetModalRef = ComponentRef<typeof BottomSheetModal>;

export function useBottomSheetModal() {
  const ref = useRef<BottomSheetModalRef>(null);

  const open = useCallback(() => {
    ref.current?.present();
  }, []);

  const close = useCallback(() => {
    ref.current?.dismiss();
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
}: BottomSheetModalProps & { sheetRef: React.RefObject<BottomSheetModalRef | null> }) {
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
    sheetRef.current?.dismiss();
  }, [onCancel, sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
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
      <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
        {/* Icon */}
        <View className="mb-4 items-center">
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: config.iconBg }}
          >
            <MaterialIcons
              name={config.iconName}
              size={28}
              color={config.iconColor}
            />
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
        <View className="mt-auto flex-row gap-3">
          <Button
            title={cancelLabel}
            variant="secondary"
            size="lg"
            onPress={handleCancel}
            className="flex-1"
          />
          <Button
            title={confirmLabel}
            variant={config.confirmVariant}
            size="lg"
            loading={loading}
            onPress={onConfirm}
            className="flex-1"
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
