// Interface d'accès aux données et fabrique choisissant l'implémentation
// selon l'environnement (SQLite Tauri en desktop, localStorage en web).
import type { Account, AccountStatus, Client, KycStatus, Transaction, User, UserStatus } from "@/lib/types";
import { isTauri } from "@/lib/env";

export interface Repository {
  init(): Promise<void>;

  countUsers(): Promise<number>;
  seed(users: User[], clients: Client[], accounts: Account[], transactions: Transaction[]): Promise<void>;

  listUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  setUserStatus(id: string, status: UserStatus): Promise<void>;

  listClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  createClient(client: Client): Promise<void>;
  setKycStatus(id: string, status: KycStatus): Promise<void>;

  listAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  createAccount(account: Account): Promise<void>;
  setAccountBalance(id: string, balance: number): Promise<void>;
  setAccountStatus(id: string, status: AccountStatus): Promise<void>;
  setOverdraftLimit(id: string, limit: number): Promise<void>;

  listTransactions(): Promise<Transaction[]>;
  listTransactionsByAccount(accountId: string): Promise<Transaction[]>;
  createTransaction(tx: Transaction): Promise<void>;
}

// Single-flight : une seule promesse d'initialisation partagée, même en cas
// d'appels concurrents (React StrictMode, requêtes parallèles au démarrage).
let repoPromise: Promise<Repository> | null = null;

export function getRepository(): Promise<Repository> {
  if (repoPromise) return repoPromise;
  repoPromise = (async () => {
    let repo: Repository;
    if (isTauri()) {
      const { SqlRepository } = await import("./sqlRepository");
      repo = new SqlRepository();
    } else {
      const { LocalRepository } = await import("./localRepository");
      repo = new LocalRepository();
    }
    await repo.init();
    return repo;
  })();
  return repoPromise;
}
