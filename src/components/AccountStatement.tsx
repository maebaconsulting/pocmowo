// Relevé de compte imprimable : sélection de période, solde d'ouverture/clôture,
// détail des mouvements et totaux. Bouton « Imprimer » → boîte d'impression du système
// (export PDF possible). Le contenu .mw-statement-sheet est isolé pour l'impression.
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { Account, Client } from "@/lib/types";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_STATUS_LABELS, ID_TYPE_LABELS } from "@/lib/types";
import { formatXOF, formatDate, formatDateTime } from "@/lib/format";
import { listTransactionsByAccount } from "@/services/transactions";
import { isTauri } from "@/lib/env";
import { useToast } from "@/hooks/useToast";
import { Select } from "./ui/Select";
import { CAMPOST_LOGO } from "@/lib/logo";
import { IconClose, IconReport } from "@/lib/icons";

// En desktop (WKWebView ne gère pas window.print()), on construit un HTML autonome
// du relevé (styles inline + auto-impression) ouvert dans le navigateur par défaut.
async function printSheet(sheet: HTMLElement, reference: string): Promise<void> {
  let css = "";
  for (const ss of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(ss.cssRules)) css += rule.cssText + "\n";
    } catch {
      /* feuille cross-origin (Google Fonts) ignorée */
    }
  }
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Relevé ${reference}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}
body{background:#fff;margin:0;padding:28px;font-family:'Inter',system-ui,sans-serif}
.mw-no-print{display:none!important}
.mw-statement-sheet{box-shadow:none!important;margin:0 auto!important;max-width:760px}
</style></head><body>${sheet.outerHTML}
<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},500)})</script>
</body></html>`;
  await invoke("open_statement", { html });
}

type Period = "all" | "30" | "90" | "year";

const PERIOD_OPTIONS = [
  { value: "all", label: "Tout l'historique" },
  { value: "30", label: "30 derniers jours" },
  { value: "90", label: "90 derniers jours" },
  { value: "year", label: "Année en cours" },
];

interface Props {
  open: boolean;
  account: Account | null;
  client?: Client | null;
  onClose: () => void;
}

function periodStartMs(period: Period): number {
  if (period === "all") return -Infinity;
  const now = new Date();
  if (period === "year") return new Date(now.getFullYear(), 0, 1).getTime();
  const days = period === "30" ? 30 : 90;
  return now.getTime() - days * 24 * 3600 * 1000;
}

export function AccountStatement({ open, account, client, onClose }: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const toast = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);

  async function handlePrint() {
    if (!isTauri()) {
      window.print();
      return;
    }
    if (!sheetRef.current) return;
    try {
      await printSheet(sheetRef.current, reference);
      toast.success("Relevé prêt", "Ouvert dans le navigateur pour impression ou export PDF.");
    } catch (e) {
      toast.error("Impression impossible", e instanceof Error ? e.message : String(e));
    }
  }

  const { data: txs = [] } = useQuery({
    queryKey: ["account-tx", account?.id],
    queryFn: () => listTransactionsByAccount(account!.id),
    enabled: !!account,
  });

  const model = useMemo(() => {
    const asc = [...txs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const startMs = periodStartMs(period);
    const before = asc.filter((t) => new Date(t.createdAt).getTime() < startMs);
    const opening = before.length ? before[before.length - 1].balanceAfter : 0;
    const rows = asc.filter((t) => {
      const ms = new Date(t.createdAt).getTime();
      return ms >= startMs && ms <= Date.now();
    });
    const closing = rows.length ? rows[rows.length - 1].balanceAfter : opening;
    const totalDep = rows.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
    const totalRet = rows.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
    return { rows, opening, closing, totalDep, totalRet };
  }, [txs, period]);

  if (!open || !account) return null;

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "";
  const reference = `REL-${account.number}-${new Date().toISOString().slice(0, 10)}`;

  return (
    <div className="mw-overlay" onMouseDown={onClose}>
      <div className="mw-statement-shell" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mw-statement-toolbar mw-no-print">
          <Select
            variant="pill"
            ariaLabel="Période du relevé"
            value={period}
            onChange={(v) => setPeriod(v as Period)}
            options={PERIOD_OPTIONS}
          />
          <div style={{ flex: 1 }} />
          <button className="mw-btn mw-btn--primary" onClick={handlePrint}>
            <IconReport size={18} /> Imprimer le relevé
          </button>
          <button className="mw-btn mw-btn--ghost mw-btn--icon" onClick={onClose} aria-label="Fermer">
            <IconClose size={18} />
          </button>
        </div>

        <div className="mw-statement-sheet" ref={sheetRef}>
          {/* En-tête */}
          <div className="mw-statement-head">
            <div className="mw-statement-brand">
              <img src={CAMPOST_LOGO} alt="CAMPOST" className="mw-statement-logo" />
              <div>
                <div className="mw-statement-name">CAMPOST</div>
                <div className="mw-statement-sub">Core Banking · Services financiers postaux</div>
              </div>
            </div>
            <div className="mw-statement-title">
              <div className="mw-statement-doc">Relevé de compte</div>
              <div className="mw-statement-ref">{reference}</div>
              <div className="mw-statement-ref">Édité le {formatDateTime(new Date().toISOString())}</div>
            </div>
          </div>

          {/* Informations titulaire / compte */}
          <div className="mw-statement-info">
            <div>
              <div className="mw-statement-info__label">Titulaire</div>
              <div className="mw-statement-info__value">{account.holderName}</div>
              {client && (
                <>
                  <div className="mw-statement-info__line">{client.phone}</div>
                  <div className="mw-statement-info__line">
                    {[client.address, client.city].filter(Boolean).join(", ")}
                  </div>
                  <div className="mw-statement-info__line">
                    {ID_TYPE_LABELS[client.idType]} · {client.idNumber}
                  </div>
                </>
              )}
            </div>
            <div>
              <div className="mw-statement-info__label">Compte</div>
              <div className="mw-statement-info__value mw-mono">{account.number}</div>
              <div className="mw-statement-info__line">
                Type : {ACCOUNT_TYPE_LABELS[account.type]} · {ACCOUNT_STATUS_LABELS[account.status]}
              </div>
              <div className="mw-statement-info__line">Période : {periodLabel}</div>
              <div className="mw-statement-info__line">
                Solde actuel : <strong>{formatXOF(account.balance)}</strong>
              </div>
            </div>
          </div>

          {/* Tableau des mouvements */}
          <table className="mw-statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th className="num">Débit</th>
                <th className="num">Crédit</th>
                <th className="num">Solde</th>
              </tr>
            </thead>
            <tbody>
              <tr className="mw-statement-balrow">
                <td colSpan={4}>Solde d'ouverture</td>
                <td className="num mw-mono">{formatXOF(model.opening)}</td>
              </tr>
              {model.rows.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.createdAt)}</td>
                  <td>{t.label}</td>
                  <td className="num mw-mono">{t.type === "withdrawal" ? formatXOF(t.amount) : ""}</td>
                  <td className="num mw-mono">{t.type === "deposit" ? formatXOF(t.amount) : ""}</td>
                  <td className="num mw-mono">{formatXOF(t.balanceAfter)}</td>
                </tr>
              ))}
              {model.rows.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--mw-fg-muted)", padding: "20px" }}>
                    Aucun mouvement sur la période.
                  </td>
                </tr>
              )}
              <tr className="mw-statement-balrow mw-statement-balrow--strong">
                <td colSpan={4}>Solde de clôture</td>
                <td className="num mw-mono">{formatXOF(model.closing)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totaux */}
          <div className="mw-statement-totals">
            <div>
              <span className="mw-statement-info__label">Total crédits</span>
              <div className="mw-mono" style={{ color: "var(--mw-success-fg)", fontWeight: 600 }}>
                {formatXOF(model.totalDep)}
              </div>
            </div>
            <div>
              <span className="mw-statement-info__label">Total débits</span>
              <div className="mw-mono" style={{ color: "var(--mw-peach-fg)", fontWeight: 600 }}>
                {formatXOF(model.totalRet)}
              </div>
            </div>
            <div>
              <span className="mw-statement-info__label">Mouvements</span>
              <div className="mw-mono" style={{ fontWeight: 600 }}>
                {model.rows.length}
              </div>
            </div>
          </div>

          <div className="mw-statement-foot">
            Document généré par le système core banking CAMPOST. Les montants sont exprimés en franc CFA (XAF, BEAC).
          </div>
        </div>
      </div>
    </div>
  );
}
