// Types du domaine MoWoBank. Les montants sont en centimes (entiers) — voir lib/format.ts.

export type UserRole = "admin" | "agent";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  createdAt: string; // ISO 8601
}

// ---------- Client (clientèle / KYC) ----------
export type KycStatus = "pending" | "verified" | "rejected";
export type IdType = "cni" | "passeport" | "permis";
export type Gender = "M" | "F";

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  gender: Gender;
  birthDate: string; // ISO (date)
  occupation: string;
  idType: IdType;
  idNumber: string;
  address: string;
  city: string;
  kycStatus: KycStatus;
  createdBy: string; // User.id
  createdAt: string;
}

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  pending: "En attente",
  verified: "Vérifié",
  rejected: "Rejeté",
};

export const ID_TYPE_LABELS: Record<IdType, string> = {
  cni: "Carte nationale d'identité",
  passeport: "Passeport",
  permis: "Permis de conduire",
};

export const GENDER_LABELS: Record<Gender, string> = {
  M: "Masculin",
  F: "Féminin",
};

export type AccountType = "epargne" | "courant" | "tontine";
export type AccountStatus = "active" | "frozen" | "closed";

export interface Account {
  id: string;
  number: string;
  clientId: string; // Client.id
  holderName: string;
  holderPhone: string;
  type: AccountType;
  balance: number; // centimes
  status: AccountStatus;
  openedBy: string; // User.id
  createdAt: string;
}

export type TransactionType = "deposit" | "withdrawal";

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number; // centimes, > 0
  balanceAfter: number; // centimes
  label: string;
  performedBy: string; // User.id
  createdAt: string;
}

// Utilisateur sans empreinte de mot de passe (exposé à l'UI).
export type SafeUser = Omit<User, "passwordHash">;

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  epargne: "Épargne",
  courant: "Courant",
  tontine: "Tontine",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Actif",
  frozen: "Gelé",
  closed: "Clôturé",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  agent: "Agent",
};
