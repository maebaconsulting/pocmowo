// Tableau de bord : indicateurs, graphique d'activité, dernières transactions.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getDashboardData } from "@/services/dashboard";
import { listAccounts } from "@/services/accounts";
import { formatXOF, formatXOFCompact, formatDateTime } from "@/lib/format";
import { TxTypeChip, Avatar, EmptyState } from "@/components/ui/atoms";
import { OperationModal } from "@/components/OperationModal";
import { IconCoins, IconWallet, IconUsers, IconTransactions, IconPlus, IconDeposit, IconWithdraw } from "@/lib/icons";
import type { TransactionType } from "@/lib/types";

export function Dashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const [op, setOp] = useState<TransactionType | null>(null);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <div className="mw-page-actions">
        <button className="mw-btn mw-btn--accent" onClick={() => setOp("deposit")}>
          <IconDeposit size={18} /> Nouveau dépôt
        </button>
        <button className="mw-btn mw-btn--secondary" onClick={() => setOp("withdrawal")}>
          <IconWithdraw size={18} /> Nouveau retrait
        </button>
      </div>

      <div className="mw-grid-metrics">
        <MetricCard
          tone="sage"
          icon={<IconCoins size={18} />}
          label="Épargne collectée"
          value={formatXOFCompact(data.totalSavings)}
          full={formatXOF(data.totalSavings)}
        />
        <MetricCard
          tone="yellow"
          icon={<IconWallet size={18} />}
          label="Comptes actifs"
          value={String(data.activeAccounts)}
          full={`${data.totalClients} clients au total`}
        />
        <MetricCard
          tone="lilac"
          icon={<IconUsers size={18} />}
          label="Clients"
          value={String(data.totalClients)}
          full="Titulaires de comptes"
        />
        <MetricCard
          tone="peach"
          icon={<IconTransactions size={18} />}
          label="Volume du jour"
          value={formatXOFCompact(data.todayVolume)}
          full={`${data.todayCount} opération(s)`}
        />
      </div>

      <div className="mw-grid-2col">
        <div className="mw-card">
          <div className="mw-card__head">
            <div>
              <h3 className="mw-h3">Activité des 7 derniers jours</h3>
              <p className="mw-caption">Dépôts et retraits (FCFA)</p>
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A7C07E" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A7C07E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F0B488" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#F0B488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DA" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7178" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fontSize: 11, fill: "#9AA0A6" }}
                  tickFormatter={(v) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(v as number)}
                />
                <Tooltip
                  formatter={(v: number, n) => [
                    new Intl.NumberFormat("fr-FR").format(v) + " FCFA",
                    n === "depots" ? "Dépôts" : "Retraits",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E6E4DA",
                    fontSize: 13,
                    boxShadow: "var(--mw-shadow-2)",
                  }}
                />
                <Area type="monotone" dataKey="depots" stroke="#7E9B52" strokeWidth={2} fill="url(#gDep)" />
                <Area type="monotone" dataKey="retraits" stroke="#C77E47" strokeWidth={2} fill="url(#gRet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mw-card mw-card--flush">
          <div style={{ padding: "20px 24px 8px" }} className="mw-row-between">
            <h3 className="mw-h3">Dernières transactions</h3>
          </div>
          {data.recentTransactions.length === 0 ? (
            <EmptyState title="Aucune transaction" body="Les opérations apparaîtront ici." icon={<IconTransactions />} />
          ) : (
            <div style={{ padding: "0 8px 8px" }}>
              {data.recentTransactions.map((t) => {
                const acc = data.accountsById[t.accountId];
                return (
                  <div key={t.id} className="mw-menu__item" style={{ cursor: "default" }}>
                    <Avatar name={acc?.holderName ?? "?"} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mw-label" style={{ fontWeight: 600 }}>
                        {acc?.holderName ?? "Compte"}
                      </div>
                      <div className="mw-caption">{formatDateTime(t.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        className="mw-mono"
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: t.type === "deposit" ? "var(--mw-success-fg)" : "var(--mw-peach-fg)",
                        }}
                      >
                        {t.type === "deposit" ? "+" : "−"}
                        {formatXOF(t.amount)}
                      </div>
                      <TxTypeChip type={t.type} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <OperationModal
        open={op !== null}
        defaultType={op ?? "deposit"}
        accounts={accounts}
        onClose={() => setOp(null)}
        onDone={refresh}
      />
    </>
  );
}

function MetricCard({
  tone,
  icon,
  label,
  value,
  full,
}: {
  tone: "sage" | "yellow" | "lilac" | "peach";
  icon: React.ReactNode;
  label: string;
  value: string;
  full: string;
}) {
  return (
    <div className={`mw-metric-card mw-metric-card--${tone}`}>
      <div className="mw-metric-card__top">
        <span className="mw-metric-card__label">{label}</span>
        <span className="mw-metric-card__icon">{icon}</span>
      </div>
      <div className="mw-metric-card__value" title={full} style={{ fontSize: "clamp(26px, 2.4vw, 34px)" }}>
        {value}
      </div>
      <div className="mw-caption" style={{ color: "rgba(17,25,31,0.55)" }}>
        {full}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mw-grid-metrics" style={{ marginTop: 40 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mw-skel" style={{ height: 168, borderRadius: 28 }} />
      ))}
    </div>
  );
}
