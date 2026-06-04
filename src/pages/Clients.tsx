// Page Clients & KYC : répertoire clients, dossiers d'identité, validation KYC,
// comptes liés et ouverture de compte rattachée à un client.
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listClients, createClient, setKycStatus, createClientSchema } from "@/services/clients";
import { listAccounts, createAccount } from "@/services/accounts";
import type { Account, Client, Gender, IdType, KycStatus } from "@/lib/types";
import {
  ID_TYPE_LABELS,
  GENDER_LABELS,
  KYC_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
} from "@/lib/types";
import { formatXOF, formatDate, parseAmountToCents, initials } from "@/lib/format";
import { KycStatusChip, AccountStatusChip, AccountTypeChip, Avatar, EmptyState } from "@/components/ui/atoms";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Drawer } from "@/components/ui/Drawer";
import { AccountStatement } from "@/components/AccountStatement";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import {
  IconPlus,
  IconClient,
  IconPhone,
  IconMail,
  IconId,
  IconLocation,
  IconBriefcase,
  IconCheck,
  IconClose,
  IconWallet,
  IconReport,
} from "@/lib/icons";

export function Clients() {
  const qc = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: listClients });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: listAccounts });
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState<"" | KycStatus>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["clients"] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const accountsByClient = useMemo(() => {
    const map: Record<string, Account[]> = {};
    accounts.forEach((a) => {
      if (!a.clientId) return;
      (map[a.clientId] ??= []).push(a);
    });
    return map;
  }, [accounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (kycFilter && c.kycStatus !== kycFilter) return false;
      if (q && !`${c.fullName} ${c.phone} ${c.idNumber} ${c.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [clients, search, kycFilter]);

  const counts = useMemo(
    () => ({
      total: clients.length,
      verified: clients.filter((c) => c.kycStatus === "verified").length,
      pending: clients.filter((c) => c.kycStatus === "pending").length,
    }),
    [clients],
  );

  const detail = clients.find((c) => c.id === detailId) ?? null;

  return (
    <>
      <div className="mw-page-actions">
        <div className="mw-topbar__search" style={{ minWidth: 280 }}>
          <input
            placeholder="Rechercher (nom, téléphone, pièce, ville)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher"
          />
        </div>
        <Select
          variant="pill"
          ariaLabel="Filtrer par statut KYC"
          value={kycFilter}
          onChange={(v) => setKycFilter(v as KycStatus | "")}
          options={[
            { value: "", label: "Tous les statuts KYC" },
            { value: "verified", label: "Vérifiés" },
            { value: "pending", label: "En attente" },
            { value: "rejected", label: "Rejetés" },
          ]}
        />
        <div className="mw-spacer" />
        <button className="mw-btn mw-btn--primary" onClick={() => setCreateOpen(true)}>
          <IconPlus size={18} /> Nouveau client
        </button>
      </div>

      <div className="mw-grid-metrics" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 18 }}>
        <SummaryCard tone="lilac" label="Clients enregistrés" value={String(counts.total)} />
        <SummaryCard tone="sage" label="KYC vérifiés" value={String(counts.verified)} />
        <SummaryCard tone="yellow" label="KYC en attente" value={String(counts.pending)} />
      </div>

      <div className="mw-card mw-card--flush">
        {isLoading ? (
          <div style={{ padding: 24 }} className="mw-stack-gap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mw-skel mw-skel--text" style={{ height: 40 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Aucun client" body="Enregistrez un premier client pour démarrer le KYC." icon={<IconClient />} />
        ) : (
          <div className="mw-table-wrap">
            <table className="mw-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Pièce</th>
                  <th>KYC</th>
                  <th style={{ textAlign: "center" }}>Comptes</th>
                  <th>Enregistré le</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setDetailId(c.id)} style={{ cursor: "pointer" }}>
                    <td>
                      <div className="mw-cell-user">
                        <Avatar name={c.fullName} size="sm" />
                        <div>
                          <div className="mw-label" style={{ fontWeight: 600 }}>
                            {c.fullName}
                          </div>
                          <div className="mw-caption">
                            {GENDER_LABELS[c.gender]} · {c.city || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mw-mono" style={{ fontSize: 13 }}>
                        {c.phone}
                      </span>
                    </td>
                    <td>
                      <div className="mw-sm">{ID_TYPE_LABELS[c.idType]}</div>
                      <div className="mw-cell-id" style={{ fontSize: 12 }}>
                        {c.idNumber}
                      </div>
                    </td>
                    <td>
                      <KycStatusChip status={c.kycStatus} />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="mw-mono" style={{ fontWeight: 600 }}>
                        {accountsByClient[c.id]?.length ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="mw-caption">{formatDate(c.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateClientModal open={createOpen} onClose={() => setCreateOpen(false)} onDone={refresh} />

      <ClientDrawer
        client={detail}
        accounts={detail ? accountsByClient[detail.id] ?? [] : []}
        onClose={() => setDetailId(null)}
        onKyc={async (status) => {
          if (!detail) return;
          await setKycStatus(detail.id, status);
          refresh();
        }}
        onAccountOpened={refresh}
      />
    </>
  );
}

function SummaryCard({ tone, label, value }: { tone: "lilac" | "sage" | "yellow"; label: string; value: string }) {
  return (
    <div className={`mw-metric-card mw-metric-card--${tone}`} style={{ minHeight: 0, padding: "18px 22px" }}>
      <span className="mw-metric-card__label">{label}</span>
      <div className="mw-metric-card__value" style={{ fontSize: 30 }}>
        {value}
      </div>
    </div>
  );
}

// ---------- Création d'un client ----------
function CreateClientModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "M" as Gender,
    birthDate: "",
    occupation: "",
    idType: "cni" as IdType,
    idNumber: "",
    address: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  function reset() {
    setForm({ fullName: "", phone: "", email: "", gender: "M", birthDate: "", occupation: "", idType: "cni", idNumber: "", address: "", city: "" });
    setError(null);
  }

  async function submit() {
    setError(null);
    const parsed = createClientSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Champs invalides.");
    setBusy(true);
    try {
      const c = await createClient(parsed.data, user!.id);
      toast.success("Client enregistré", `${c.fullName} · KYC en attente`);
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
      title="Nouveau client"
      subtitle="Créer un dossier client (KYC en attente)"
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
            {busy ? "Enregistrement…" : "Enregistrer le client"}
          </button>
        </>
      }
    >
      <div className="mw-form-grid">
        <div className="mw-field">
          <label className="mw-field__label">Nom complet</label>
          <input className="mw-input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nom et prénom" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="mw-field">
            <label className="mw-field__label">Téléphone</label>
            <input className="mw-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+221 …" />
          </div>
          <div className="mw-field">
            <label className="mw-field__label">Genre</label>
            <Select
              value={form.gender}
              onChange={(v) => set("gender", v)}
              options={[
                { value: "M", label: "Masculin" },
                { value: "F", label: "Féminin" },
              ]}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="mw-field">
            <label className="mw-field__label">Date de naissance</label>
            <input className="mw-input" type="date" value={form.birthDate ? form.birthDate.slice(0, 10) : ""} onChange={(e) => set("birthDate", e.target.value ? new Date(e.target.value).toISOString() : "")} />
          </div>
          <div className="mw-field">
            <label className="mw-field__label">Profession</label>
            <input className="mw-input" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="Activité" />
          </div>
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Courriel (facultatif)</label>
          <input className="mw-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="client@exemple.sn" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="mw-field">
            <label className="mw-field__label">Type de pièce</label>
            <Select
              value={form.idType}
              onChange={(v) => set("idType", v)}
              options={[
                { value: "cni", label: "Carte d'identité" },
                { value: "passeport", label: "Passeport" },
                { value: "permis", label: "Permis de conduire" },
              ]}
            />
          </div>
          <div className="mw-field">
            <label className="mw-field__label">Numéro de pièce</label>
            <input className="mw-input" value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} placeholder="N° du document" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
          <div className="mw-field">
            <label className="mw-field__label">Adresse (facultatif)</label>
            <input className="mw-input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Quartier, rue" />
          </div>
          <div className="mw-field">
            <label className="mw-field__label">Ville</label>
            <input className="mw-input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Ville" />
          </div>
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

// ---------- Fiche client / KYC ----------
function ClientDrawer({
  client,
  accounts,
  onClose,
  onKyc,
  onAccountOpened,
}: {
  client: Client | null;
  accounts: Account[];
  onClose: () => void;
  onKyc: (status: KycStatus) => void;
  onAccountOpened: () => void;
}) {
  const [openAccount, setOpenAccount] = useState(false);
  const [stmtAccount, setStmtAccount] = useState<Account | null>(null);
  if (!client) return null;

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <>
      <Drawer
        open={!!client}
        onClose={onClose}
        header={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={client.fullName} size="md" />
            <div>
              <h3 className="mw-h3">{client.fullName}</h3>
              <div className="mw-caption">
                {GENDER_LABELS[client.gender]} · {client.occupation || "—"}
              </div>
            </div>
          </div>
        }
      >
        <div className="mw-stack-gap">
          {/* Bandeau KYC */}
          <div
            className="mw-metric-card mw-metric-card--white"
            style={{ minHeight: 0, gap: 12, padding: "18px 20px" }}
          >
            <div className="mw-row-between">
              <span className="mw-metric-card__label">Statut KYC</span>
              <KycStatusChip status={client.kycStatus} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {client.kycStatus !== "verified" && (
                <button className="mw-btn mw-btn--accent mw-btn--sm" onClick={() => onKyc("verified")}>
                  <IconCheck size={16} /> Valider le KYC
                </button>
              )}
              {client.kycStatus !== "rejected" && (
                <button className="mw-btn mw-btn--destructive mw-btn--sm" onClick={() => onKyc("rejected")}>
                  <IconClose size={16} /> Rejeter
                </button>
              )}
              {client.kycStatus !== "pending" && (
                <button className="mw-btn mw-btn--secondary mw-btn--sm" onClick={() => onKyc("pending")}>
                  Remettre en attente
                </button>
              )}
            </div>
          </div>

          {/* Identité */}
          <div>
            <div className="mw-label" style={{ marginBottom: 10 }}>
              Identité
            </div>
            <div className="mw-stack-gap" style={{ gap: 10 }}>
              <InfoRow icon={<IconPhone size={16} />} label="Téléphone" value={client.phone} mono />
              {client.email && <InfoRow icon={<IconMail size={16} />} label="Courriel" value={client.email} />}
              <InfoRow icon={<IconId size={16} />} label={ID_TYPE_LABELS[client.idType]} value={client.idNumber} mono />
              <InfoRow icon={<IconBriefcase size={16} />} label="Profession" value={client.occupation || "—"} />
              <InfoRow
                icon={<IconLocation size={16} />}
                label="Adresse"
                value={[client.address, client.city].filter(Boolean).join(", ") || "—"}
              />
              <InfoRow label="Date de naissance" value={client.birthDate ? formatDate(client.birthDate) : "—"} />
              <InfoRow label="Enregistré le" value={formatDate(client.createdAt)} />
            </div>
          </div>

          {/* Comptes liés */}
          <div>
            <div className="mw-row-between" style={{ marginBottom: 10 }}>
              <span className="mw-label">Comptes ({accounts.length})</span>
              <span className="mw-mono" style={{ fontWeight: 600, fontSize: 13 }}>
                {formatXOF(totalBalance)}
              </span>
            </div>
            {accounts.length === 0 ? (
              <p className="mw-caption" style={{ marginBottom: 10 }}>
                Aucun compte rattaché.
              </p>
            ) : (
              <div className="mw-stack-gap" style={{ gap: 8 }}>
                {accounts.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      border: "1px solid var(--mw-border)",
                      borderRadius: "var(--mw-radius-md)",
                    }}
                  >
                    <span className="mw-metric-card__icon" style={{ width: 32, height: 32 }}>
                      <IconWallet size={16} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mw-cell-id" style={{ fontSize: 13 }}>
                        {a.number}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                        <AccountTypeChip type={a.type} />
                        <AccountStatusChip status={a.status} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="mw-cell-amount">{formatXOF(a.balance)}</span>
                      <button
                        className="mw-btn mw-btn--ghost mw-btn--sm"
                        style={{ display: "flex", marginLeft: "auto", marginTop: 4, padding: "4px 8px", gap: 6 }}
                        onClick={() => setStmtAccount(a)}
                      >
                        <IconReport size={14} /> Relevé
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="mw-btn mw-btn--secondary mw-btn--sm mw-btn--block"
              style={{ marginTop: 10 }}
              onClick={() => setOpenAccount(true)}
              disabled={client.kycStatus !== "verified"}
              title={client.kycStatus !== "verified" ? "Le KYC doit être validé pour ouvrir un compte" : undefined}
            >
              <IconPlus size={16} /> Ouvrir un compte
            </button>
            {client.kycStatus !== "verified" && (
              <p className="mw-caption" style={{ marginTop: 6 }}>
                KYC à valider avant l'ouverture d'un compte.
              </p>
            )}
          </div>
        </div>
      </Drawer>

      <OpenAccountForClient
        open={openAccount}
        client={client}
        onClose={() => setOpenAccount(false)}
        onDone={onAccountOpened}
      />

      <AccountStatement
        open={!!stmtAccount}
        account={stmtAccount}
        client={client}
        onClose={() => setStmtAccount(null)}
      />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="mw-row-between mw-sm">
      <span className="mw-muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        {icon}
        {label}
      </span>
      <span className={mono ? "mw-mono" : undefined} style={{ textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

// ---------- Ouverture de compte rattachée au client ----------
function OpenAccountForClient({
  open,
  client,
  onClose,
  onDone,
}: {
  open: boolean;
  client: Client;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [type, setType] = useState<Account["type"]>("epargne");
  const [initial, setInitial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    const initialCents = initial.trim() ? parseAmountToCents(initial) : 0;
    if (initialCents === null) return setError("Dépôt initial invalide.");
    setBusy(true);
    try {
      const acc = await createAccount(
        { holderName: client.fullName, holderPhone: client.phone, type, initialDeposit: "" },
        initialCents,
        user!.id,
        client.id,
      );
      toast.success("Compte ouvert", `${acc.number} · ${client.fullName}`);
      setInitial("");
      setType("epargne");
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
      subtitle={`Nouveau compte pour ${client.fullName}`}
      onClose={onClose}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: "var(--mw-surface-muted)",
            borderRadius: "var(--mw-radius-md)",
          }}
        >
          <span className="mw-avatar mw-avatar--sm" style={{ background: "var(--mw-info-bg)", color: "var(--mw-info-fg)" }}>
            {initials(client.fullName)}
          </span>
          <div>
            <div className="mw-label" style={{ fontWeight: 600 }}>
              {client.fullName}
            </div>
            <div className="mw-caption">Titulaire · KYC {KYC_STATUS_LABELS[client.kycStatus]}</div>
          </div>
        </div>
        <div className="mw-field">
          <label className="mw-field__label">Type de compte</label>
          <Select
            value={type}
            onChange={(v) => setType(v as Account["type"])}
            options={[
              { value: "epargne", label: ACCOUNT_TYPE_LABELS.epargne },
              { value: "courant", label: ACCOUNT_TYPE_LABELS.courant },
              { value: "tontine", label: ACCOUNT_TYPE_LABELS.tontine },
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
