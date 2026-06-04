// Implémentation web : persistance dans localStorage (mode développement / démo navigateur).
import type { Account, AccountStatus, Client, KycStatus, Transaction, User, UserStatus } from "@/lib/types";
import type { Repository } from "./repository";

interface Store {
  users: User[];
  clients: Client[];
  accounts: Account[];
  transactions: Transaction[];
}

const KEY = "mowobank:v6";

function emptyStore(): Store {
  return { users: [], clients: [], accounts: [], transactions: [] };
}

// Renvoie une copie profonde : évite que le cache React Query conserve des
// références vers les objets internes mutés sur place (sinon pas de re-render).
function clone<T>(value: T): T {
  return structuredClone(value);
}

export class LocalRepository implements Repository {
  private store: Store = emptyStore();

  async init(): Promise<void> {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        this.store = { ...emptyStore(), ...(JSON.parse(raw) as Store) };
      } catch {
        this.store = emptyStore();
      }
    }
  }

  private persist(): void {
    localStorage.setItem(KEY, JSON.stringify(this.store));
  }

  async countUsers(): Promise<number> {
    return this.store.users.length;
  }

  async seed(users: User[], clients: Client[], accounts: Account[], transactions: Transaction[]): Promise<void> {
    this.store = { users, clients, accounts, transactions };
    this.persist();
  }

  async listClients(): Promise<Client[]> {
    return clone([...this.store.clients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getClient(id: string): Promise<Client | null> {
    const c = this.store.clients.find((x) => x.id === id);
    return c ? clone(c) : null;
  }

  async createClient(client: Client): Promise<void> {
    this.store.clients.push(client);
    this.persist();
  }

  async setKycStatus(id: string, status: KycStatus): Promise<void> {
    const c = this.store.clients.find((x) => x.id === id);
    if (c) c.kycStatus = status;
    this.persist();
  }

  async listUsers(): Promise<User[]> {
    return clone([...this.store.users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const u = this.store.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    return u ? clone(u) : null;
  }

  async createUser(user: User): Promise<void> {
    this.store.users.push(user);
    this.persist();
  }

  async setUserStatus(id: string, status: UserStatus): Promise<void> {
    const u = this.store.users.find((x) => x.id === id);
    if (u) u.status = status;
    this.persist();
  }

  async listAccounts(): Promise<Account[]> {
    return clone([...this.store.accounts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getAccount(id: string): Promise<Account | null> {
    const a = this.store.accounts.find((x) => x.id === id);
    return a ? clone(a) : null;
  }

  async createAccount(account: Account): Promise<void> {
    this.store.accounts.push(account);
    this.persist();
  }

  async setAccountBalance(id: string, balance: number): Promise<void> {
    const a = this.store.accounts.find((x) => x.id === id);
    if (a) a.balance = balance;
    this.persist();
  }

  async setAccountStatus(id: string, status: AccountStatus): Promise<void> {
    const a = this.store.accounts.find((x) => x.id === id);
    if (a) a.status = status;
    this.persist();
  }

  async setOverdraftLimit(id: string, limit: number): Promise<void> {
    const a = this.store.accounts.find((x) => x.id === id);
    if (a) a.overdraftLimit = limit;
    this.persist();
  }

  async listTransactions(): Promise<Transaction[]> {
    return clone([...this.store.transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async listTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    return clone(
      this.store.transactions
        .filter((t) => t.accountId === accountId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  }

  async createTransaction(tx: Transaction): Promise<void> {
    this.store.transactions.push(tx);
    this.persist();
  }
}
