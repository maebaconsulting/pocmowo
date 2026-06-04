// Implémentation desktop : SQLite réel via le plugin SQL officiel de Tauri.
import Database from "@tauri-apps/plugin-sql";
import type { Account, AccountStatus, Client, KycStatus, Transaction, User, UserStatus } from "@/lib/types";
import type { Repository } from "./repository";
import { SCHEMA_SQL } from "./schema";

// Lignes renvoyées par SQLite (snake_case) mappées vers le domaine (camelCase).
interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: User["role"];
  status: UserStatus;
  password_hash: string;
  created_at: string;
}
interface ClientRow {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  gender: Client["gender"];
  birth_date: string;
  occupation: string;
  id_type: Client["idType"];
  id_number: string;
  address: string;
  city: string;
  kyc_status: KycStatus;
  created_by: string;
  created_at: string;
}
interface AccountRow {
  id: string;
  number: string;
  client_id: string;
  holder_name: string;
  holder_phone: string;
  type: Account["type"];
  balance: number;
  overdraft_limit: number;
  status: AccountStatus;
  opened_by: string;
  created_at: string;
}
interface TxRow {
  id: string;
  account_id: string;
  type: Transaction["type"];
  amount: number;
  balance_after: number;
  label: string;
  performed_by: string;
  created_at: string;
}

const toUser = (r: UserRow): User => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  role: r.role,
  status: r.status,
  passwordHash: r.password_hash,
  createdAt: r.created_at,
});
const toClient = (r: ClientRow): Client => ({
  id: r.id,
  fullName: r.full_name,
  phone: r.phone,
  email: r.email,
  gender: r.gender,
  birthDate: r.birth_date,
  occupation: r.occupation,
  idType: r.id_type,
  idNumber: r.id_number,
  address: r.address,
  city: r.city,
  kycStatus: r.kyc_status,
  createdBy: r.created_by,
  createdAt: r.created_at,
});
const toAccount = (r: AccountRow): Account => ({
  id: r.id,
  number: r.number,
  clientId: r.client_id,
  holderName: r.holder_name,
  holderPhone: r.holder_phone,
  type: r.type,
  balance: r.balance,
  overdraftLimit: r.overdraft_limit,
  status: r.status,
  openedBy: r.opened_by,
  createdAt: r.created_at,
});
const toTx = (r: TxRow): Transaction => ({
  id: r.id,
  accountId: r.account_id,
  type: r.type,
  amount: r.amount,
  balanceAfter: r.balance_after,
  label: r.label,
  performedBy: r.performed_by,
  createdAt: r.created_at,
});

export class SqlRepository implements Repository {
  private db!: Database;

  async init(): Promise<void> {
    // v2 : schéma enrichi (clients/KYC). Nouveau fichier pour repartir proprement.
    this.db = await Database.load("sqlite:mowobank_v6.db");
    // Le DDL contient plusieurs instructions : on les exécute séquentiellement.
    for (const stmt of SCHEMA_SQL.split(";")) {
      const s = stmt.trim();
      if (s) await this.db.execute(s);
    }
  }

  async countUsers(): Promise<number> {
    const rows = await this.db.select<{ n: number }[]>("SELECT COUNT(*) AS n FROM users");
    return rows[0]?.n ?? 0;
  }

  async seed(users: User[], clients: Client[], accounts: Account[], transactions: Transaction[]): Promise<void> {
    for (const u of users) await this.createUser(u);
    for (const c of clients) await this.createClient(c);
    for (const a of accounts) await this.createAccount(a);
    for (const t of transactions) await this.createTransaction(t);
  }

  async listClients(): Promise<Client[]> {
    const rows = await this.db.select<ClientRow[]>("SELECT * FROM clients ORDER BY created_at DESC");
    return rows.map(toClient);
  }

  async getClient(id: string): Promise<Client | null> {
    const rows = await this.db.select<ClientRow[]>("SELECT * FROM clients WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ? toClient(rows[0]) : null;
  }

  async createClient(c: Client): Promise<void> {
    await this.db.execute(
      `INSERT INTO clients (id, full_name, phone, email, gender, birth_date, occupation, id_type, id_number, address, city, kyc_status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [c.id, c.fullName, c.phone, c.email, c.gender, c.birthDate, c.occupation, c.idType, c.idNumber, c.address, c.city, c.kycStatus, c.createdBy, c.createdAt],
    );
  }

  async setKycStatus(id: string, status: KycStatus): Promise<void> {
    await this.db.execute("UPDATE clients SET kyc_status = $1 WHERE id = $2", [status, id]);
  }

  async listUsers(): Promise<User[]> {
    const rows = await this.db.select<UserRow[]>("SELECT * FROM users ORDER BY created_at DESC");
    return rows.map(toUser);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await this.db.select<UserRow[]>(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async createUser(u: User): Promise<void> {
    await this.db.execute(
      `INSERT INTO users (id, full_name, email, role, status, password_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [u.id, u.fullName, u.email, u.role, u.status, u.passwordHash, u.createdAt],
    );
  }

  async setUserStatus(id: string, status: UserStatus): Promise<void> {
    await this.db.execute("UPDATE users SET status = $1 WHERE id = $2", [status, id]);
  }

  async listAccounts(): Promise<Account[]> {
    const rows = await this.db.select<AccountRow[]>("SELECT * FROM accounts ORDER BY created_at DESC");
    return rows.map(toAccount);
  }

  async getAccount(id: string): Promise<Account | null> {
    const rows = await this.db.select<AccountRow[]>("SELECT * FROM accounts WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ? toAccount(rows[0]) : null;
  }

  async createAccount(a: Account): Promise<void> {
    await this.db.execute(
      `INSERT INTO accounts (id, number, client_id, holder_name, holder_phone, type, balance, overdraft_limit, status, opened_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [a.id, a.number, a.clientId, a.holderName, a.holderPhone, a.type, a.balance, a.overdraftLimit, a.status, a.openedBy, a.createdAt],
    );
  }

  async setAccountBalance(id: string, balance: number): Promise<void> {
    await this.db.execute("UPDATE accounts SET balance = $1 WHERE id = $2", [balance, id]);
  }

  async setAccountStatus(id: string, status: AccountStatus): Promise<void> {
    await this.db.execute("UPDATE accounts SET status = $1 WHERE id = $2", [status, id]);
  }

  async setOverdraftLimit(id: string, limit: number): Promise<void> {
    await this.db.execute("UPDATE accounts SET overdraft_limit = $1 WHERE id = $2", [limit, id]);
  }

  async listTransactions(): Promise<Transaction[]> {
    const rows = await this.db.select<TxRow[]>("SELECT * FROM transactions ORDER BY created_at DESC");
    return rows.map(toTx);
  }

  async listTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const rows = await this.db.select<TxRow[]>(
      "SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC",
      [accountId],
    );
    return rows.map(toTx);
  }

  async createTransaction(t: Transaction): Promise<void> {
    await this.db.execute(
      `INSERT INTO transactions (id, account_id, type, amount, balance_after, label, performed_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [t.id, t.accountId, t.type, t.amount, t.balanceAfter, t.label, t.performedBy, t.createdAt],
    );
  }
}
