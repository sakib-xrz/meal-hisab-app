import Constants from "expo-constants";

const DEFAULT_PORT = "8000";

function getDevServerHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;

  // e.g. "192.168.0.200:8081" or "exp://192.168.0.200:8081"
  const cleaned = hostUri.replace(/^exp:\/\//, "").replace(/^https?:\/\//, "");
  return cleaned.split(":")[0] || null;
}

function getConfiguredUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ??
    "http://localhost:8000"
  );
}

function getPortFromUrl(url: string): string {
  try {
    return new URL(url).port || DEFAULT_PORT;
  } catch {
    return DEFAULT_PORT;
  }
}

/**
 * On a physical device, localhost points at the phone — not your dev machine.
 * In dev, rewrite localhost to the same host Metro uses (e.g. 192.168.x.x).
 */
export function getApiBaseUrl(): string {
  const configured = getConfiguredUrl();

  if (!__DEV__) {
    return configured;
  }

  const usesLocalhost = /localhost|127\.0\.0\.1/.test(configured);
  if (!usesLocalhost) {
    return configured;
  }

  const devHost = getDevServerHost();
  if (!devHost) {
    return configured;
  }

  const port = getPortFromUrl(configured);
  return `http://${devHost}:${port}`;
}

export function getApiBaseUrlForDisplay(): string {
  return getApiBaseUrl();
}
