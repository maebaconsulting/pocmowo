// Service d'agrégation pour le tableau de bord.
import type { Account, Transaction } from "@/lib/types";
import { getRepository } from "@/database/repository";

export interface DashboardData {
  totalSavings: number; // centimes, somme des soldes des comptes actifs
  activeAccounts: number;
  totalClients: number;
  todayVolume: number; // centimes, volume des transactions du jour
  todayCount: number;
  recentTransactions: Transaction[];
  accountsById: Record<string, Account>;
  series: Array<{ day: string; depots: number; retraits: number }>; // en francs
}

function isSameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  const repo = await getRepository();
  const [accounts, transactions, clients] = await Promise.all([
    repo.listAccounts(),
    repo.listTransactions(),
    repo.listClients(),
  ]);

  const accountsById: Record<string, Account> = {};
  accounts.forEach((a) => (accountsById[a.id] = a));

  const active = accounts.filter((a) => a.status === "active");
  const totalSavings = active.reduce((sum, a) => sum + a.balance, 0);

  const now = new Date();
  const today = transactions.filter((t) => isSameDay(t.createdAt, now));
  const todayVolume = today.reduce((sum, t) => sum + t.amount, 0);

  // Série des 7 derniers jours (dépôts / retraits) en francs.
  const series: DashboardData["series"] = [];
  for (let i = 6; i >= 0; i--) {
    const ref = new Date();
    ref.setDate(ref.getDate() - i);
    const dayTx = transactions.filter((t) => isSameDay(t.createdAt, ref));
    series.push({
      day: new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(ref),
      depots: dayTx.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0) / 100,
      retraits: dayTx.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0) / 100,
    });
  }

  return {
    totalSavings,
    activeAccounts: active.length,
    totalClients: clients.length,
    todayVolume,
    todayCount: today.length,
    recentTransactions: transactions.slice(0, 6),
    accountsById,
    series,
  };
}
