import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Brand } from "@/constants/theme";
import { cn } from "@/lib/utils/cn";

type ScreenProps = ScrollViewProps & {
  title?: string;
  subtitle?: string;
  hero?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoid?: boolean;
  footer?: React.ReactNode;
  contentClassName?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function Screen({
  title,
  subtitle,
  hero,
  children,
  refreshing,
  onRefresh,
  keyboardAvoid = false,
  footer,
  contentContainerStyle,
  contentClassName,
  className,
  edges = ["top"],
  ...props
}: ScreenProps) {
  const content = (
    <ScrollView
      style={styles.scroll}
      className={className}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={Brand.primary}
            colors={[Brand.primary]}
          />
        ) : undefined
      }
      {...props}
    >
      <View className={cn("px-4 pb-8", contentClassName)}>
        {hero}
        {title ? (
          <Text className="mt-2 mb-1 font-sans text-2xl font-bold text-foreground">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="mb-4 font-sans text-base text-muted">{subtitle}</Text>
        ) : null}
        {children}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} className="bg-background" edges={edges}>
      {keyboardAvoid ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {footer ? (
        <View className="border-t border-border bg-background px-4 pt-3 pb-4">
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <SafeAreaView style={styles.safe} className="items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#0d9488" />
      <Text className="mt-3 font-sans text-base text-muted">{message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
