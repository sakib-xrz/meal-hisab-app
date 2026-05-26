import { Redirect } from "expo-router";

import { useAuth } from "@/context/auth-provider";

export default function Index() {
  const { isLoading, token, messId } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!messId) {
    return <Redirect href="/(onboarding)/create-mess" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
