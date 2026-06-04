// Composition de l'application : providers, amorçage des données, routage et garde d'accès.
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToast";
import { bootstrapData } from "@/database/bootstrap";
import { AppShell } from "@/components/layout/AppShell";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Accounts } from "@/pages/Accounts";
import { Transactions } from "@/pages/Transactions";
import { Users } from "@/pages/Users";
import { Clients } from "@/pages/Clients";
import { ModuleOverview } from "@/pages/ModuleOverview";
import { PLACEHOLDER_ITEMS } from "@/lib/nav";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 10_000 } },
});

export default function App() {
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await bootstrapData();
      } catch (e) {
        console.error("[MoWoBank] échec d'initialisation :", e);
        const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
        setBootError(msg || "Erreur d'initialisation inconnue.");
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  if (!booted) return <Splash />;
  if (bootError) return <Splash error={bootError} />;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnly>
                    <Login />
                  </PublicOnly>
                }
              />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/comptes" element={<Accounts />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route
                  path="/utilisateurs"
                  element={
                    <RequireRole role="admin">
                      <Users />
                    </RequireRole>
                  }
                />
                {PLACEHOLDER_ITEMS.map((item) => (
                  <Route key={item.to} path={item.to} element={<ModuleOverview />} />
                ))}
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireRole({ role, children }: { role: "admin" | "agent"; children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Splash({ error }: { error?: string }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--mw-ink)",
        color: "var(--mw-cream)",
      }}
    >
      <BrandLogo size={56} radius={16} />
      <div style={{ fontFamily: "var(--mw-font-display)", fontSize: 20, fontWeight: 700 }}>
        CAMPOST <span style={{ color: "var(--mw-fg-on-ink-muted)", fontWeight: 600 }}>Core Banking</span>
      </div>
      {error ? (
        <div className="mw-sm" style={{ color: "var(--mw-danger-solid)", maxWidth: 360, textAlign: "center" }}>
          {error}
        </div>
      ) : (
        <div className="mw-caption" style={{ color: "var(--mw-fg-on-ink-muted)" }}>
          Chargement…
        </div>
      )}
    </div>
  );
}
