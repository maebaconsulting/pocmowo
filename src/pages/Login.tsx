// Écran de connexion avec comptes de démonstration pré-remplissables.
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { IconArrowRight } from "@/lib/icons";

const DEMO = [
  { label: "Administrateur", email: "admin@campost.cm", password: "admin123" },
  { label: "Agent", email: "agent@campost.cm", password: "agent123" },
];

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Connexion impossible.");
  }

  return (
    <div className="mw-login">
      <div className="mw-login__aside">
        <div className="mw-login__brand">
          <BrandLogo size={48} />
          <div>
            <div style={{ fontFamily: "var(--mw-font-display)", fontSize: 22, fontWeight: 700 }}>CAMPOST</div>
            <div className="mw-caption" style={{ color: "var(--mw-fg-on-ink-muted)" }}>
              Core Banking
            </div>
          </div>
        </div>
        <div className="mw-login__pitch">
          <h2>Le core banking de CAMPOST.</h2>
          <p>
            La plateforme bancaire centrale de CAMPOST : comptes, épargne, dépôts, retraits, crédit et
            conformité réunis dans un poste de travail unique, rapide et fiable, au service des agences.
          </p>
        </div>
        <div className="mw-caption" style={{ color: "var(--mw-fg-on-ink-muted)" }}>
          © 2026 CAMPOST · Core Banking
        </div>
      </div>

      <div className="mw-login__form-wrap">
        <div className="mw-login__card">
          <h1 className="mw-h1" style={{ marginBottom: 6 }}>
            Connexion
          </h1>
          <p className="mw-sm mw-muted" style={{ marginBottom: 24 }}>
            Accédez à votre espace de gestion.
          </p>

          {error && (
            <div className="mw-alert mw-alert--danger" style={{ marginBottom: 16 }}>
              <span className="mw-alert__body">{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="mw-form-grid">
            <div className="mw-field">
              <label className="mw-field__label" htmlFor="email">
                Courriel
              </label>
              <input
                id="email"
                className="mw-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@campost.cm"
                autoComplete="username"
                required
              />
            </div>
            <div className="mw-field">
              <label className="mw-field__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className="mw-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="mw-btn mw-btn--primary mw-btn--lg mw-btn--block" type="submit" disabled={busy}>
              {busy ? "Connexion…" : "Se connecter"}
              <IconArrowRight size={18} />
            </button>
          </form>

          <div className="mw-login__demo">
            <div className="mw-caption" style={{ marginTop: 6 }}>
              Comptes de démonstration (cliquer pour remplir)
            </div>
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                className="mw-login__demo-row"
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                }}
              >
                <span className="mw-label">{d.label}</span>
                <span className="mw-mono" style={{ fontSize: 12, color: "var(--mw-fg-muted)" }}>
                  {d.email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
