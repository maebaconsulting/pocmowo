// Petits composants d'interface : puces de statut, avatar, état vide.
import type { ReactNode } from "react";
import type {
  AccountStatus,
  AccountType,
  KycStatus,
  TransactionType,
  UserRole,
  UserStatus,
} from "@/lib/types";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_TYPE_LABELS, KYC_STATUS_LABELS, ROLE_LABELS } from "@/lib/types";
import { initials } from "@/lib/format";

type ChipTone = "neutral" | "info" | "success" | "warning" | "peach" | "danger" | "ink";

export function Chip({ tone, children }: { tone: ChipTone; children: ReactNode }) {
  return (
    <span className={`mw-chip mw-chip--${tone} mw-chip--sm`}>
      <span className="mw-chip__dot" />
      {children}
    </span>
  );
}

export function AccountStatusChip({ status }: { status: AccountStatus }) {
  const tone: ChipTone = status === "active" ? "success" : status === "frozen" ? "warning" : "neutral";
  return <Chip tone={tone}>{ACCOUNT_STATUS_LABELS[status]}</Chip>;
}

export function UserStatusChip({ status }: { status: UserStatus }) {
  return <Chip tone={status === "active" ? "success" : "danger"}>{status === "active" ? "Actif" : "Suspendu"}</Chip>;
}

export function RoleChip({ role }: { role: UserRole }) {
  return <Chip tone={role === "admin" ? "info" : "peach"}>{ROLE_LABELS[role]}</Chip>;
}

const TYPE_TONE: Record<AccountType, ChipTone> = { epargne: "info", courant: "peach", tontine: "neutral" };
export function AccountTypeChip({ type }: { type: AccountType }) {
  return <Chip tone={TYPE_TONE[type]}>{ACCOUNT_TYPE_LABELS[type]}</Chip>;
}

export function TxTypeChip({ type }: { type: TransactionType }) {
  return type === "deposit" ? <Chip tone="success">Dépôt</Chip> : <Chip tone="peach">Retrait</Chip>;
}

const KYC_TONE: Record<KycStatus, ChipTone> = { verified: "success", pending: "warning", rejected: "danger" };
export function KycStatusChip({ status }: { status: KycStatus }) {
  return <Chip tone={KYC_TONE[status]}>{KYC_STATUS_LABELS[status]}</Chip>;
}

const AVATAR_BG = ["info", "success", "warning", "peach", "danger"] as const;
export function Avatar({ name, size = "sm" }: { name: string; size?: "xs" | "sm" | "md" | "lg" }) {
  // Couleur déterministe à partir du nom.
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_BG.length;
  const tone = AVATAR_BG[idx];
  return (
    <span
      className={`mw-avatar mw-avatar--${size}`}
      style={{ background: `var(--mw-${tone}-bg)`, color: `var(--mw-${tone}-fg)` }}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) {
  return (
    <div className="mw-empty">
      {icon && <div className="mw-empty__icon">{icon}</div>}
      <div className="mw-empty__title">{title}</div>
      {body && <div className="mw-empty__body">{body}</div>}
    </div>
  );
}
