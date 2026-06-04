// Contexte d'authentification : session courante, connexion et déconnexion.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SafeUser } from "@/lib/types";
import { login as loginService } from "@/services/auth";

interface AuthContextValue {
  user: SafeUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const SESSION_KEY = "mowobank:session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as SafeUser);
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      async login(email, password) {
        const res = await loginService(email, password);
        if (res.ok && res.user) {
          setUser(res.user);
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
        }
        return { ok: res.ok, error: res.error };
      },
      logout() {
        setUser(null);
        sessionStorage.removeItem(SESSION_KEY);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
