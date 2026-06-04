// Page Transactions : historique global avec filtres type / compte et saisie d'opération.
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTransactions } from "@/services/transactions";
import { listAccounts } from "@/services/accounts";
import { formatXOF, formatDateTime } from "@/lib/format";
import { TxTypeChip, Avatar, EmptyState } from "@/components/ui/atoms";
import { OperationModal } from "@/components/OperationModal";
import { Select } from "@/components/ui/Select";
import { IconTransactions, IconPlus } from "@/lib/icons";
import type { TransactionType } from "@/lib/types";

export function Transactions() {
  const qc = useQueryClient();
  const { data: txs = [], isLoading } = useQuery({ queryKey: ["transactions"], queryFn: listTransactions });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const [typeFilter, setTypeFilter] = useState<"" | TransactionType>("");
  const [accountFilter, setAccountFilter] = useState("");
  const [opOpen, setOpOpen] = useState(false);

  const accountsById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const filtered = useMemo(
    () =>
      txs.filter((t) => {
        if (typeFilter && t.type !== typeFilter) return false;
        if (accountFilter && t.accountId !== accountFilter) return false;
        return true;
      }),
    [txs, typeFilter, accountFilter],
  );

  function refresh() {
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const totalDep = filtered.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalRet = filtered.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <div className="mw-page-actions">
        <Select
          variant="pill"
          ariaLabel="Filtrer par type"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TransactionType | "")}
          options={[
            { value: "", label: "Tous les types" },
            { value: "deposit", label: "Dépôts" },
            { value: "withdrawal", label: "Retraits" },
          ]}
        />
        <Select
          variant="pill"
          ariaLabel="Filtrer par compte"
          value={accountFilter}
          onChange={setAccountFilter}
          options={[
            { value: "", label: "Tous les comptes" },
            ...accounts.map((a) => ({ value: a.id, label: `${a.number} · ${a.holderName}` })),
          ]}
        />
        <div className="mw-spacer" />
        <button className="mw-btn mw-btn--primary" onClick={() => setOpOpen(true)}>
          <IconPlus size={18} /> Nouvelle opération
        </button>
      </div>

      <div className="mw-grid-metrics" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
        <SummaryCard label="Opérations" value={String(filtered.length)} tone="lilac" />
        <SummaryCard label="Total dépôts" value={formatXOF(totalDep)} tone="sage" />
        <SummaryCard label="Total retraits" value={formatXOF(totalRet)} tone="peach" />
      </div>

      <div className="mw-card mw-card--flush">
        {isLoading ? (
          <div style={{ padding: 24 }} className="mw-stack-gap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mw-skel mw-skel--text" style={{ height: 40 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucune transaction" body="Aucune opération ne correspond aux filtres." icon={<IconTransactions />} />
        ) : (
          <div className="mw-table-wrap">
            <table className="mw-table">
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th style={{ textAlign: "right" }}>Montant</th>
                  <th style={{ textAlign: "right" }}>Solde après</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const acc = accountsById[t.accountId];
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="mw-cell-user">
                          <Avatar name={acc?.holderName ?? "?"} size="xs" />
                          <div>
                            <div className="mw-label" style={{ fontWeight: 600 }}>
                              {acc?.holderName ?? "—"}
                            </div>
                            <div className="mw-cell-id" style={{ fontSize: 12 }}>
                              {acc?.number ?? ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mw-sm">{t.label}</span>
                      </td>
                      <td>
                        <TxTypeChip type={t.type} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          className="mw-cell-amount"
                          style={{ color: t.type === "deposit" ? "var(--mw-success-fg)" : "var(--mw-peach-fg)" }}
                        >
                          {t.type === "deposit" ? "+" : "−"}
                          {formatXOF(t.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span className="mw-cell-amount" style={{ fontWeight: 500 }}>
                          {formatXOF(t.balanceAfter)}
                        </span>
                      </td>
                      <td>
                        <span className="mw-caption">{formatDateTime(t.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OperationModal open={opOpen} accounts={accounts} onClose={() => setOpOpen(false)} onDone={refresh} />
    </>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "sage" | "peach" | "lilac" }) {
  return (
    <div className={`mw-metric-card mw-metric-card--${tone}`} style={{ minHeight: 0, padding: "18px 22px" }}>
      <span className="mw-metric-card__label">{label}</span>
      <div className="mw-metric-card__value" style={{ fontSize: 28 }}>
        {value}
      </div>
    </div>
  );
}
