import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getMe,
} from "@/lib/api/auth";
import { setUnauthorizedHandler } from "@/lib/api/client";
import type { RoleKey, User } from "@/lib/api/types";
import {
  clearMessId,
  clearSession,
  getAccessToken,
  getMessId,
  setAccessToken,
  setMessId,
} from "@/lib/auth/session";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthState = {
  user: User | null;
  token: string | null;
  messId: string | null;
  myRole: RoleKey | null;
  isLoading: boolean;
  isManagerOrAbove: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (name: string, phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setMessIdState: (id: string) => Promise<void>;
  clearMess: () => Promise<void>;
  isOwner: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

function resolveMessId(
  user: User | null,
  storedMessId: string | null,
): string | null {
  if (!user?.memberships?.length) return null;
  const active = user.memberships.find((m) => m.status === "ACTIVE");
  if (active) return active.messId;
  if (storedMessId && user.memberships.some((m) => m.messId === storedMessId)) {
    return storedMessId;
  }
  return user.memberships[0]?.messId ?? null;
}

function resolveRole(user: User | null, messId: string | null): RoleKey | null {
  if (!user || !messId) return null;
  const membership = user.memberships.find((m) => m.messId === messId);
  return membership?.roleKey ?? null;
}

async function persistAuth(user: User, token: string) {
  await setAccessToken(token);
  const messId = resolveMessId(user, await getMessId());
  if (messId) {
    await setMessId(messId);
  } else {
    await clearMessId();
  }
  return messId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [messId, setMessIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const myRole = useMemo(() => resolveRole(user, messId), [user, messId]);
  const isOwner = myRole === "OWNER";
  const isManagerOrAbove = isOwner || myRole === "MANAGER";

  const refreshUser = useCallback(async () => {
    const storedToken = await getAccessToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setMessIdState(null);
      return;
    }

    const me = await getMe();
    const resolvedMessId = resolveMessId(me, await getMessId());
    if (resolvedMessId) {
      await setMessId(resolvedMessId);
    } else {
      await clearMessId();
    }
    setUser(me);
    setToken(storedToken);
    setMessIdState(resolvedMessId);
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (token) await apiLogout();
    } catch {
      // ignore logout errors
    }
    await clearSession();
    setUser(null);
    setToken(null);
    setMessIdState(null);
  }, [token]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
  }, [signOut]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedToken = await getAccessToken();
        if (storedToken) {
          await refreshUser();
        }
      } catch {
        await clearSession();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const signIn = useCallback(async (phone: string, password: string) => {
    const result = await apiLogin({ phone, password });
    const resolvedMessId = await persistAuth(result.user, result.accessToken);
    setUser(result.user);
    setToken(result.accessToken);
    setMessIdState(resolvedMessId);
  }, []);

  const signUp = useCallback(
    async (name: string, phone: string, password: string) => {
      const result = await apiRegister({ name, phone, password });
      const resolvedMessId = await persistAuth(result.user, result.accessToken);
      setUser(result.user);
      setToken(result.accessToken);
      setMessIdState(resolvedMessId);
    },
    [],
  );

  const setMessIdAndPersist = useCallback(
    async (id: string) => {
      await setMessId(id);
      setMessIdState(id);
      await refreshUser();
    },
    [refreshUser],
  );

  const clearMess = useCallback(async () => {
    await clearMessId();
    setMessIdState(null);
    await refreshUser();
  }, [refreshUser]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      messId,
      myRole,
      isLoading,
      isOwner,
      isManagerOrAbove,
      signIn,
      signUp,
      signOut,
      refreshUser,
      setMessIdState: setMessIdAndPersist,
      clearMess,
    }),
    [
      user,
      token,
      messId,
      myRole,
      isLoading,
      isOwner,
      isManagerOrAbove,
      signIn,
      signUp,
      signOut,
      refreshUser,
      setMessIdAndPersist,
      clearMess,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
