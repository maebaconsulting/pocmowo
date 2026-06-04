// Service de gestion des comptes.
import { z } from "zod";
import type { Account, AccountStatus, AccountType } from "@/lib/types";
import { getRepository } from "@/database/repository";
import { uid } from "@/lib/env";
import { createTransaction } from "./transactions";

export const createAccountSchema = z.object({
  holderName: z.string().min(2, "Nom du titulaire requis"),
  holderPhone: z.string().optional().default(""),
  type: z.enum(["epargne", "courant", "tontine"]),
  initialDeposit: z.string().optional().default(""),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

async function nextAccountNumber(): Promise<string> {
  const repo = await getRepository();
  const accounts = await repo.listAccounts();
  const max = accounts.reduce((acc, a) => {
    const n = Number(a.number.replace("MW-", ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 100000);
  return `MW-${max + 1}`;
}

export async function listAccounts(): Promise<Account[]> {
  const repo = await getRepository();
  return repo.listAccounts();
}

export async function getAccount(id: string): Promise<Account | null> {
  const repo = await getRepository();
  return repo.getAccount(id);
}

export async function createAccount(
  input: CreateAccountInput,
  initialCents: number,
  operatorId: string,
  clientId = "",
): Promise<Account> {
  const repo = await getRepository();
  const account: Account = {
    id: uid("acc_"),
    number: await nextAccountNumber(),
    clientId,
    holderName: input.holderName.trim(),
    holderPhone: input.holderPhone?.trim() ?? "",
    type: input.type as AccountType,
    balance: 0,
    status: "active",
    openedBy: operatorId,
    createdAt: new Date().toISOString(),
  };
  await repo.createAccount(account);

  if (initialCents > 0) {
    await createTransaction(
      { accountId: account.id, type: "deposit", amountCents: initialCents, label: "Dépôt d'ouverture" },
      operatorId,
    );
    account.balance = initialCents;
  }
  return account;
}

export async function setAccountStatus(id: string, status: AccountStatus): Promise<void> {
  const repo = await getRepository();
  await repo.setAccountStatus(id, status);
}
