// Modale d'opération : dépôt ou retrait, avec contrôle du solde et retour visuel.
import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Select } from "./ui/Select";
import type { Account, TransactionType } from "@/lib/types";
import { formatXOF, parseAmountToCents } from "@/lib/format";
import { ACCOUNT_TYPE_LABELS } from "@/lib/types";
import { createTransaction } from "@/services/transactions";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface Props {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  accounts: Account[];
  lockedAccountId?: string;
  defaultType?: TransactionType;
}

export function OperationModal({ open, onClose, onDone, accounts, lockedAccountId, defaultType = "deposit" }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [accountId, setAccountId] = useState(lockedAccountId ?? "");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAccountId(lockedAccountId ?? "");
      setAmount("");
      setLabel("");
      setError(null);
    }
  }, [open, defaultType, lockedAccountId]);

  const selected = accounts.find((a) => a.id === accountId);
  const cents = parseAmountToCents(amount);

  async function submit() {
    setError(null);
    if (!selected) return setError("Veuillez sélectionner un compte.");
    if (cents === null) return setError("Montant invalide.");
    if (type === "withdrawal" && cents > selected.balance) {
      return setError("Solde insuffisant pour ce retrait.");
    }
    setBusy(true);
    try {
      await createTransaction({ accountId: selected.id, type, amountCents: cents, label }, user!.id);
      toast.success(
        type === "deposit" ? "Dépôt enregistré" : "Retrait enregistré",
        `${formatXOF(cents)} · ${selected.holderName}`,
      );
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'opération.");
    } finally {
      setBusy(false);
    }
  }

  const activeAccounts = accounts.filter((a) => a.status === "active");

  return (
    <Modal
      open={open}
      title={type === "deposit" ? "Nouveau dépôt" : "Nouveau retrait"}
      subtitle="Saisir une opération sur un compte"
      onClose={onClose}
      footer={
        <>
          <button className="mw-btn mw-btn--secondary" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button className="mw-btn mw-btn--primary" onClick={submit} disabled={busy}>
            {busy ? "Enregistrement…" : "Valider l'opération"}
          </button>
        </>
      }
    >
      <div className="mw-form-grid">
        {/* Sélecteur de type */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`mw-btn ${type === "deposit" ? "mw-btn--accent" : "mw-btn--secondary"} mw-btn--block`}
            onClick={() => setType("deposit")}
            type="button"
          >
            Dépôt
          </button>
          <button
            className={`mw-btn ${type === "withdrawal" ? "mw-btn--accent" : "mw-btn--secondary"} mw-btn--block`}
            onClick={() => setType("withdrawal")}
            type="button"
          >
            Retrait
          </button>
        </div>

        <div className="mw-field">
          <label className="mw-field__label">Compte</label>
          <Select
            value={accountId}
            onChange={setAccountId}
            disabled={!!lockedAccountId}
            placeholder="Sélectionner un compte…"
            options={activeAccounts.map((a) => ({
              value: a.id,
              label: `${a.number} · ${a.holderName} (${ACCOUNT_TYPE_LABELS[a.type]})`,
            }))}
          />
          {selected && (
            <span className="mw-field__hint">
              Solde actuel : <strong className="mw-mono">{formatXOF(selected.balance)}</strong>
            </span>
          )}
        </div>

        <div className="mw-field">
          <label className="mw-field__label">Montant (FCFA)</label>
          <div className="mw-input-group">
            <input
              className="mw-input"
              style={{ paddingLeft: 14 }}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          {cents !== null && <span className="mw-field__hint">{formatXOF(cents)}</span>}
        </div>

        <div className="mw-field">
          <label className="mw-field__label">Libellé (facultatif)</label>
          <input
            className="mw-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={type === "deposit" ? "Versement épargne" : "Retrait guichet"}
          />
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
