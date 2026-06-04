// Service des opérations (dépôts et retraits) avec contrôle des invariants métier.
import type { Transaction, TransactionType } from "@/lib/types";
import { getRepository } from "@/database/repository";
import { uid } from "@/lib/env";

export interface NewTransactionInput {
  accountId: string;
  type: TransactionType;
  amountCents: number;
  label: string;
}

export async function listTransactions(): Promise<Transaction[]> {
  const repo = await getRepository();
  return repo.listTransactions();
}

export async function listTransactionsByAccount(accountId: string): Promise<Transaction[]> {
  const repo = await getRepository();
  return repo.listTransactionsByAccount(accountId);
}

/**
 * Enregistre une opération en appliquant les règles métier :
 * compte actif, montant strictement positif, solde suffisant pour un retrait.
 * Met à jour le solde du compte de façon atomique côté service.
 */
export async function createTransaction(
  input: NewTransactionInput,
  operatorId: string,
): Promise<Transaction> {
  const repo = await getRepository();
  const account = await repo.getAccount(input.accountId);
  if (!account) throw new Error("Compte introuvable.");
  if (account.status !== "active") {
    throw new Error("Opération impossible : le compte n'est pas actif.");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Le montant doit être strictement positif.");
  }
  if (input.type === "withdrawal" && input.amountCents > account.balance) {
    throw new Error("Solde insuffisant pour ce retrait.");
  }

  const balanceAfter =
    input.type === "deposit"
      ? account.balance + input.amountCents
      : account.balance - input.amountCents;

  const tx: Transaction = {
    id: uid("tx_"),
    accountId: account.id,
    type: input.type,
    amount: input.amountCents,
    balanceAfter,
    label: input.label.trim() || (input.type === "deposit" ? "Dépôt" : "Retrait"),
    performedBy: operatorId,
    createdAt: new Date().toISOString(),
  };

  await repo.createTransaction(tx);
  await repo.setAccountBalance(account.id, balanceAfter);
  return tx;
}
