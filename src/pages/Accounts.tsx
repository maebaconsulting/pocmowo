// Page Comptes : liste filtrable, ouverture de compte, fiche détaillée avec opérations.
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listAccounts, createAccount, setAccountStatus, setOverdraftLimit } from "@/services/accounts";
import { listTransactionsByAccount } from "@/services/transactions";
import { createAccountSchema } from "@/services/accounts";
import type { Account, AccountStatus, AccountType, TransactionType } from "@/lib/types";
import { ACCOUNT_TYPE_LABELS, availableBalance } from "@/lib/types";
import { formatXOF, formatDate, formatDateTime, parseAmountToCents } from "@/lib/format";
import { AccountStatusChip, AccountTypeChip, Avatar, Chip, EmptyState, TxTypeChip } from "@/components/ui/atoms";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Drawer";
import { OperationModal } from "@/components/OperationModal";
import { AccountStatement } from "@/components/AccountStatement";
import { listClients } from "@/services/clients";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconWallet, IconDeposit, IconWithdraw, IconPhone, IconReport } from "@/lib/icons";

export function Accounts() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | AccountType>("");
  const [statusFilter, setStatusFilter] = useState<"" | AccountStatus>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [op, setOp] = useState<TransactionType | null>(null);
  const [statementOpen, setStatementOpen] = useState(false);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    if (detailId) qc.invalidateQueries({ queryKey: ["account-tx", detailId] });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (typeFilter && a.type !== typeFilter) return false;
      if (statusFilter && a.status !== statusFilter) return false;
      if (q && !(`${a.number} ${a.holderName} ${a.holderPhone}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [accounts, search, typeFilter, statusFilter]);

  const detail = accounts.find((a) => a.id === detailId) ?? null;

  return (
    <>
      <div className="mw-page-actions">
        <div className="mw-topbar__search" style={{ minWidth: 280 }}>
          <input
            placeholder="Rechercher (numéro, titulaire, téléphone)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher"
          />
        </div>
        <Select
          variant="pill"
          ariaLabel="Filtrer par type"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as AccountType | "")}
          options={[
            { value: "", label: "Tous les types" },
            { value: "epargne", label: "Épargne" },
            { value: "courant", label: "Courant" },
            { value: "tontine", label: "Tontine" },
          ]}
        />
        <Select
          variant="pill"
          ariaLabel="Filtrer par statut"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as AccountStatus | "")}
          options={[
            { value: "", label: "Tous les statuts" },
            { value: "active", label: "Actif" },
            { value: "frozen", label: "Gelé" },
            { value: "closed", label: "Clôturé" },
          ]}
        />
        <div className="mw-spacer" />
        <button className="mw-btn mw-btn--primary" onClick={() => setCreateOpen(true)}>
          <IconPlus size={18} /> Ouvrir un compte
        </button>
      </div>

      <div className="mw-card mw-card--flush">
        {isLoading ? (
          <div style={{ padding: 24 }} className="mw-stack-gap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mw-skel mw-skel--text" style={{ height: 40 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Aucun compte"
            body="Ouvrez un premier compte client pour commencer."
            icon={<IconWallet />}
          />
        ) : (
          <div className="mw-table-wrap">
            <table className="mw-table">
              <thead>
                <tr>
                  <th>Titulaire</th>
                  <th>Numéro</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Solde</th>
                  <th>Ouverture</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} onClick={() => setDetailId(a.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <div className="mw-cell-user">
                        <Avatar name={a.holderName} size="sm" />
                        <div>
                          <div className="mw-label" style={{ fontWeight: 600 }}>
                            {a.holderName}
                          </div>
                          <div className="mw-caption">{a.holderPhone || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mw-cell-id">{a.number}</span>
                    </td>
                    <td>
                      <AccountTypeChip type={a.type} />
                    </td>
                    <td>
                      <AccountStatusChip status={a.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className="mw-cell-amount"
                        style={{ color: a.balance < 0 ? "var(--mw-danger-fg)" : undefined }}
                      >
                        {formatXOF(a.balance)}
                      </span>
                      {a.overdraftLimit > 0 && (
                        <div className="mw-caption" style={{ marginTop: 2 }}>
                          découvert {formatXOF(a.overdraftLimit)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="mw-caption">{formatDate(a.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} onDone={refresh} />

      <AccountDrawer
        account={detail}
        onClose={() => setDetailId(null)}
        onOperate={(t) => setOp(t)}
        onStatement={() => setStatementOpen(true)}
        onStatus={async (status) => {
          if (!detail) return;
          await setAccountStatus(detail.id, status);
          refresh();
        }}
        onSetOverdraft={async (limitCents) => {
          if (!detail) return;
          await setOverdraftLimit(detail.id, limitCents);
          refresh();
        }}
      />

      <AccountStatement
        open={statementOpen}
        account={detail}
        client={clients.find((c) => c.id === detail?.clientId) ?? null}
        onClose={() => setStatementOpen(false)}
      />

      <OperationModal
        open={op !== null}
        defaultType={op ?? "deposit"}
        accounts={accounts}
        lockedAccountId={detailId ?? undefined}
        onClose={() => setOp(null)}
        onDone={refresh}
      />
    </>
  );
}

// ---------- Modale d'ouverture de compte ----------
function CreateAccountModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const [holderName, setHolderName] = useState("");
  const [holderPhone, setHolderPhone] = useState("");
  const [type, setType] = useState<AccountType>("epargne");
  const [initial, setInitial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setHolderName("");
    setHolderPhone("");
    setType("epargne");
    setInitial("");
    setError(null);
  }

  async function submit() {
    setError(null);
    const parsed = createAccountSchema.safeParse({ holderName, holderPhone, type, initialDeposit: initial });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
    const initialCents = initial.trim() ? parseAmountToCents(initial) : 0;
    if (initialCents === null) return setError("Dépôt initial invalide.");
    setBusy(true);
    try {
      const acc = await createAccount(parsed.data, initialCents, user!.id);
      toast.success("Compte ouvert", `${acc.number} · ${acc.holderName}`);
      reset();
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Ouvrir un compte"
      subtitle="Créer un compte pour un nouveau client"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <button className="mw-btn mw-btn--secondary" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button className="mw-btn mw-btn--primary" onClick={submit} disabled={busy}>
            {busy ? "Création…" : "Ouvrir le compte"}
          </button>
        </>
      }
    >
      <div className="mw-form-grid">
        <div className="mw-field">
          <label className="mw-field__label">Nom du titulaire</label>
          <input className="mw-input" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Nom et prénom" />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Téléphone</label>
          <input className="mw-input" value={holderPhone} onChange={(e) => setHolderPhone(e.target.value)} placeholder="+221 …" />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Type de compte</label>
          <Select
            value={type}
            onChange={(v) => setType(v as AccountType)}
            options={[
              { value: "epargne", label: "Épargne" },
              { value: "courant", label: "Courant" },
              { value: "tontine", label: "Tontine" },
            ]}
          />
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Dépôt initial (facultatif, FCFA)</label>
          <input className="mw-input" inputMode="numeric" value={initial} onChange={(e) => setInitial(e.target.value)} placeholder="0" />
        </div>
        {error && (
          <div className="mw-alert mw-alert--danger">
            <span className="mw-alert__body">{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------- Panneau de détail du compte ----------
// ---------- Modale de gestion du découvert autorisé ----------
function OverdraftModal({
  open,
  account,
  onClose,
  onSave,
}: {
  open: boolean;
  account: Account;
  onClose: () => void;
  onSave: (limitCents: number) => void | Promise<void>;
}) {
  const toast = useToast();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(account.overdraftLimit ? String(account.overdraftLimit / 100) : "");
      setError(null);
    }
  }, [open, account.overdraftLimit]);

  async function submit() {
    setError(null);
    const raw = value.trim();
    let cents: number | null;
    if (raw === "" || Number(raw.replace(",", ".")) === 0) cents = 0;
    else cents = parseAmountToCents(raw);
    if (cents === null) return setError("Montant invalide.");
    setBusy(true);
    try {
      await onSave(cents);
      toast.success(cents > 0 ? "Découvert autorisé" : "Découvert désactivé", account.holderName);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Découvert autorisé"
      subtitle={`Compte ${account.number} · ${account.holderName}`}
      onClose={onClose}
      footer={
        <>
          <button className="mw-btn mw-btn--secondary" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button className="mw-btn mw-btn--primary" onClick={submit} disabled={busy}>
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </>
      }
    >
      <div className="mw-form-grid">
        <p className="mw-sm mw-muted">
          Le découvert autorisé permet d'accepter des retraits au-delà du solde, jusqu'à ce plafond. Le
          solde du compte peut alors devenir négatif. Laisser à 0 pour désactiver le découvert.
        </p>
        <div className="mw-field">
          <label className="mw-field__label">Plafond de découvert (FCFA)</label>
          <input
            className="mw-input"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
          />
          <span className="mw-field__hint">Solde actuel : {formatXOF(account.balance)}</span>
        </div>
        {error && (
          <div className="mw-alert mw-alert--danger">
            <span className="mw-alert__body">{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AccountDrawer({
  account,
  onClose,
  onOperate,
  onStatement,
  onStatus,
  onSetOverdraft,
}: {
  account: Account | null;
  onClose: () => void;
  onOperate: (t: TransactionType) => void;
  onStatement: () => void;
  onStatus: (s: AccountStatus) => void;
  onSetOverdraft: (limitCents: number) => void | Promise<void>;
}) {
  const [overdraftOpen, setOverdraftOpen] = useState(false);
  const { data: txs = [] } = useQuery({
    queryKey: ["account-tx", account?.id],
    queryFn: () => listTransactionsByAccount(account!.id),
    enabled: !!account,
  });

  if (!account) return null;

  return (
    <>
      {renderDrawer()}
      <OverdraftModal
        open={overdraftOpen}
        account={account}
        onClose={() => setOverdraftOpen(false)}
        onSave={onSetOverdraft}
      />
    </>
  );

  function renderDrawer() {
    if (!account) return null;
    return (
    <Drawer
      open={!!account}
      onClose={onClose}
      header={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={account.holderName} size="md" />
          <div>
            <h3 className="mw-h3">{account.holderName}</h3>
            <div className="mw-cell-id" style={{ fontSize: 13 }}>
              {account.number}
            </div>
          </div>
        </div>
      }
    >
      <div className="mw-stack-gap">
        <div className="mw-metric-card mw-metric-card--white" style={{ minHeight: 0 }}>
          <span className="mw-metric-card__label">Solde du compte</span>
          <div
            className="mw-metric-card__value"
            style={{ color: account.balance < 0 ? "var(--mw-danger-fg)" : undefined }}
          >
            {formatXOF(account.balance)}
          </div>
          {account.overdraftLimit > 0 && (
            <div className="mw-sm mw-muted">
              Découvert autorisé {formatXOF(account.overdraftLimit)} · disponible{" "}
              <strong className="mw-mono">{formatXOF(availableBalance(account))}</strong>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <AccountTypeChip type={account.type} />
            <AccountStatusChip status={account.status} />
            {account.balance < 0 ? (
              <Chip tone="danger">En découvert</Chip>
            ) : (
              account.overdraftLimit > 0 && <Chip tone="info">Découvert autorisé</Chip>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="mw-btn mw-btn--accent mw-btn--block"
            onClick={() => onOperate("deposit")}
            disabled={account.status !== "active"}
          >
            <IconDeposit size={18} /> Dépôt
          </button>
          <button
            className="mw-btn mw-btn--secondary mw-btn--block"
            onClick={() => onOperate("withdrawal")}
            disabled={account.status !== "active"}
          >
            <IconWithdraw size={18} /> Retrait
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="mw-btn mw-btn--secondary mw-btn--block" onClick={onStatement}>
            <IconReport size={18} /> Relevé
          </button>
          <button className="mw-btn mw-btn--secondary mw-btn--block" onClick={() => setOverdraftOpen(true)}>
            <IconWallet size={18} /> Découvert
          </button>
        </div>

        {account.holderPhone && (
          <div className="mw-row-between mw-sm">
            <span className="mw-muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <IconPhone size={16} /> Téléphone
            </span>
            <span className="mw-mono">{account.holderPhone}</span>
          </div>
        )}
        <div className="mw-row-between mw-sm">
          <span className="mw-muted">Ouvert le</span>
          <span>{formatDate(account.createdAt)}</span>
        </div>

        <div>
          <div className="mw-label" style={{ marginBottom: 10, marginTop: 6 }}>
            Mouvements ({txs.length})
          </div>
          {txs.length === 0 ? (
            <p className="mw-caption">Aucun mouvement.</p>
          ) : (
            <div className="mw-timeline">
              {txs.map((t) => (
                <div className="mw-timeline__item" key={t.id}>
                  <div className="mw-timeline__rail">
                    <div className={`mw-timeline__node ${t.type === "deposit" ? "mw-timeline__node--done" : "mw-timeline__node--danger"}`}>
                      {t.type === "deposit" ? <IconDeposit size={14} /> : <IconWithdraw size={14} />}
                    </div>
                    <div className="mw-timeline__line" />
                  </div>
                  <div className="mw-timeline__content">
                    <div className="mw-row-between">
                      <span className="mw-timeline__title">{t.label}</span>
                      <span
                        className="mw-mono"
                        style={{ fontWeight: 600, fontSize: 13, color: t.type === "deposit" ? "var(--mw-success-fg)" : "var(--mw-peach-fg)" }}
                      >
                        {t.type === "deposit" ? "+" : "−"}
                        {formatXOF(t.amount)}
                      </span>
                    </div>
                    <div className="mw-timeline__meta">
                      <span>{formatDateTime(t.createdAt)}</span>
                      <span>· Solde {formatXOF(t.balanceAfter)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--mw-border)", paddingTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {account.status === "active" && (
            <button className="mw-btn mw-btn--secondary mw-btn--sm" onClick={() => onStatus("frozen")}>
              Geler le compte
            </button>
          )}
          {account.status === "frozen" && (
            <button className="mw-btn mw-btn--secondary mw-btn--sm" onClick={() => onStatus("active")}>
              Réactiver
            </button>
          )}
          {account.status !== "closed" && (
            <button className="mw-btn mw-btn--destructive mw-btn--sm" onClick={() => onStatus("closed")}>
              Clôturer
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
  }
}
