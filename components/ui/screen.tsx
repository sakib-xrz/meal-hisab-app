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

import { BrandMark } from "@/components/ui/brand-mark";
import { Brand } from "@/constants/theme";
import { cn } from "@/lib/utils/cn";

type ScreenProps = ScrollViewProps & {
  title?: string;
  subtitle?: string;
  greeting?: { name?: string | null };
  hero?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoid?: boolean;
  footer?: React.ReactNode;
  contentClassName?: string;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Screen({
  title,
  subtitle,
  greeting,
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
      style={styles.flex}
      className={cn("flex-1 bg-background", className)}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={Brand.primary}
            colors={[Brand.primary]}
            progressBackgroundColor={Brand.surface}
          />
        ) : undefined
      }
      {...props}
    >
      <View
        className={cn("px-4 pt-2", contentClassName)}
        style={{ paddingBottom: footer ? 24 : 100 }}
      >
        {hero}

        {/* Greeting header */}
        {greeting ? (
          <View className="mb-2 mt-3">
            <Text className="font-sans text-base text-muted">
              {getGreeting()}
              {greeting.name ? "," : ""} 👋
            </Text>
            {greeting.name ? (
              <Text className="mt-0.5 font-sans text-2xl font-bold text-foreground">
                {greeting.name}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Standard title */}
        {title ? (
          <Text className="mb-1 mt-2 font-sans text-3xl font-bold text-foreground">
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="mb-5 font-sans text-base text-muted">
            {subtitle}
          </Text>
        ) : null}

        {children}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={styles.flex}
      className="flex-1 bg-background"
      edges={edges}
    >
      {keyboardAvoid ? (
        <KeyboardAvoidingView
          style={styles.flex}
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {footer ? (
        <View className="border-t border-border/50 bg-surface px-4 pb-4 pt-3 shadow-lg shadow-foreground/5">
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <SafeAreaView
      style={styles.flex}
      className="flex-1 items-center justify-center bg-background px-8"
    >
      <BrandMark size="lg" variant="gradient" className="mb-5" />
      <ActivityIndicator size="large" color={Brand.primary} />
      <Text className="mt-3 font-sans text-base text-muted">{message}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
