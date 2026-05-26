import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "meal_hisab_access_token";
const MESS_ID_KEY = "meal_hisab_mess_id";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getMessId(): Promise<string | null> {
  return SecureStore.getItemAsync(MESS_ID_KEY);
}

export async function setMessId(messId: string): Promise<void> {
  await SecureStore.setItemAsync(MESS_ID_KEY, messId);
}

export async function clearMessId(): Promise<void> {
  await SecureStore.deleteItemAsync(MESS_ID_KEY);
}

export async function clearSession(): Promise<void> {
  await Promise.all([clearAccessToken(), clearMessId()]);
}
