// Page d'aperçu d'un module de la plateforme : présente son périmètre fonctionnel.
import { useLocation } from "react-router-dom";
import { NAV_ITEMS, NAV_SECTIONS } from "@/lib/nav";
import { IconArrowRight } from "@/lib/icons";

// Périmètre fonctionnel par module.
const SCOPE: Record<string, string[]> = {
  "/reporting": ["Tableaux de bord réglementaires", "Exports BCEAO et états périodiques", "Indicateurs PAR et portefeuille à risque"],
  "/caisse": ["Ouverture et arrêté de caisse", "Rapprochement des espèces", "Multi-caissiers par agence"],
  "/virements": ["Virements internes instantanés", "Virements programmés", "Bénéficiaires enregistrés"],
  "/groupes": ["Groupes solidaires", "Cycles de tontine", "Caution mutuelle"],
  "/epargne": ["Plans d'épargne et dépôts à terme", "Calcul des intérêts", "Épargne bloquée et objectifs"],
  "/credits": ["Demande et instruction de prêt", "Comité de crédit", "Décaissement et suivi du remboursement"],
  "/echeanciers": ["Plans de remboursement", "Gestion des impayés", "Relances automatiques"],
  "/agences": ["Réseau d'agences", "Affectation des agents", "Quotas et performances"],
  "/conformite": ["Validation maker-checker", "Piste d'audit complète", "Lutte anti-blanchiment (LAB/FT)"],
  "/parametres": ["Devises et taux", "Produits et grille de frais", "Droits et profils utilisateurs"],
};

export function ModuleOverview() {
  const { pathname } = useLocation();
  const item = NAV_ITEMS.find((i) => i.to === pathname);
  const section = NAV_SECTIONS.find((s) => s.items.some((i) => i.to === pathname));
  const scope = SCOPE[pathname] ?? [];

  return (
    <div className="mw-card" style={{ maxWidth: 720, margin: "8px auto 0", padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--mw-ink)", color: "var(--mw-cream)", padding: "40px 40px 36px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--mw-radius-lg)",
            background: "var(--mw-accent)",
            color: "var(--mw-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          {item?.icon}
        </div>
        {section && (
          <div className="mw-caption" style={{ color: "var(--mw-fg-on-ink-muted)", marginBottom: 8 }}>
            {section.title}
          </div>
        )}
        <h2 className="mw-h1" style={{ color: "var(--mw-cream)" }}>
          {item?.label ?? "Module"}
        </h2>
        <p className="mw-body" style={{ color: "var(--mw-fg-on-ink)", opacity: 0.82, marginTop: 12, maxWidth: 520 }}>
          {item?.subtitle}.
        </p>
      </div>

      {scope.length > 0 && (
        <div style={{ padding: "28px 40px 36px" }}>
          <div className="mw-label" style={{ marginBottom: 16, color: "var(--mw-fg-muted)" }}>
            Périmètre fonctionnel
          </div>
          <div className="mw-stack-gap">
            {scope.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  className="mw-metric-card__icon"
                  style={{ width: 30, height: 30, background: "var(--mw-accent)", color: "var(--mw-ink)" }}
                >
                  <IconArrowRight size={16} />
                </span>
                <span className="mw-body">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
