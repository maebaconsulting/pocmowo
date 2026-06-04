// Génération des données de démonstration au premier lancement.
import type { Account, Client, Transaction, User } from "@/lib/types";
import { uid } from "@/lib/env";
import { hashPassword } from "@/services/auth";
import type { Repository } from "./repository";

function daysAgo(n: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
}

function birth(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toISOString();
}

function accountNumber(seq: number): string {
  return `MW-${String(100000 + seq).slice(0, 6)}`;
}

/** Construit et insère le jeu de démonstration si la base est vide. */
export async function seedIfEmpty(repo: Repository): Promise<void> {
  if ((await repo.countUsers()) > 0) return;

  const admin: User = {
    id: uid("usr_"),
    fullName: "Nadège Mballa",
    email: "admin@campost.cm",
    role: "admin",
    status: "active",
    passwordHash: await hashPassword("admin123"),
    createdAt: daysAgo(120),
  };
  const agent: User = {
    id: uid("usr_"),
    fullName: "Patrick Mvondo",
    email: "agent@campost.cm",
    role: "agent",
    status: "active",
    passwordHash: await hashPassword("agent123"),
    createdAt: daysAgo(90),
  };
  const agent2: User = {
    id: uid("usr_"),
    fullName: "Brigitte Fouda",
    email: "brigitte@campost.cm",
    role: "agent",
    status: "active",
    passwordHash: await hashPassword("agent123"),
    createdAt: daysAgo(40),
  };
  const users = [admin, agent, agent2];

  const seed: Array<{
    holder: string;
    phone: string;
    type: Account["type"];
    opened: number;
    gender: Client["gender"];
    birthDate: string;
    occupation: string;
    idType: Client["idType"];
    idNumber: string;
    city: string;
    address: string;
    kyc: Client["kycStatus"];
  }> = [
    { holder: "Jean-Claude Mbarga", phone: "+237 6 99 12 34 56", type: "epargne", opened: 60, gender: "M", birthDate: birth(1985, 4, 12), occupation: "Commerçant", idType: "cni", idNumber: "118 456 789", city: "Douala", address: "Akwa, rue Joffre", kyc: "verified" },
    { holder: "Élise Kamga", phone: "+237 6 77 45 89 12", type: "courant", opened: 55, gender: "F", birthDate: birth(1990, 9, 3), occupation: "Couturière", idType: "cni", idNumber: "210 887 542", city: "Bafoussam", address: "Quartier Tamdja", kyc: "verified" },
    { holder: "Aboubakar Bello", phone: "+237 6 90 23 45 67", type: "tontine", opened: 48, gender: "M", birthDate: birth(1983, 1, 27), occupation: "Éleveur", idType: "cni", idNumber: "305 221 904", city: "Garoua", address: "Quartier Plateau", kyc: "pending" },
    { holder: "Solange Atangana", phone: "+237 6 55 67 89 01", type: "epargne", opened: 35, gender: "F", birthDate: birth(1982, 6, 15), occupation: "Restauratrice", idType: "passeport", idNumber: "CM0456712", city: "Yaoundé", address: "Bastos", kyc: "verified" },
    { holder: "Hervé Nkodo", phone: "+237 6 78 12 34 90", type: "epargne", opened: 28, gender: "M", birthDate: birth(1979, 11, 2), occupation: "Chauffeur", idType: "permis", idNumber: "CM-DLA-204517", city: "Ebolowa", address: "Centre-ville", kyc: "pending" },
    { holder: "Pélagie Fotso", phone: "+237 6 99 88 77 66", type: "courant", opened: 20, gender: "F", birthDate: birth(1992, 3, 21), occupation: "Infirmière", idType: "cni", idNumber: "411 902 338", city: "Dschang", address: "Quartier Foto", kyc: "verified" },
    { holder: "Aristide Onana", phone: "+237 6 70 11 22 33", type: "tontine", opened: 12, gender: "M", birthDate: birth(1986, 8, 9), occupation: "Maçon", idType: "cni", idNumber: "127 540 661", city: "Bertoua", address: "Quartier Nkolbikon", kyc: "rejected" },
    { holder: "Mireille Eboa", phone: "+237 6 66 12 34 56", type: "epargne", opened: 6, gender: "F", birthDate: birth(1996, 12, 30), occupation: "Étudiante", idType: "passeport", idNumber: "CM0345671", city: "Kribi", address: "Quartier Bord de mer", kyc: "pending" },
  ];

  const clients: Client[] = [];
  const accounts: Account[] = [];
  const transactions: Transaction[] = [];

  seed.forEach((s, i) => {
    const operator = i % 2 === 0 ? agent : agent2;

    const client: Client = {
      id: uid("cli_"),
      fullName: s.holder,
      phone: s.phone,
      email: `${s.holder.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@exemple.cm`,
      gender: s.gender,
      birthDate: s.birthDate,
      occupation: s.occupation,
      idType: s.idType,
      idNumber: s.idNumber,
      address: s.address,
      city: s.city,
      kycStatus: s.kyc,
      createdBy: operator.id,
      createdAt: daysAgo(s.opened + 1),
    };
    clients.push(client);

    const acc: Account = {
      id: uid("acc_"),
      number: accountNumber(i + 1),
      clientId: client.id,
      holderName: s.holder,
      holderPhone: s.phone,
      type: s.type,
      balance: 0,
      // Les comptes courants bénéficient d'un découvert autorisé de 50 000 FCFA.
      overdraftLimit: s.type === "courant" ? 5_000_000 : 0,
      status: "active",
      openedBy: operator.id,
      createdAt: daysAgo(s.opened),
    };

    // Dépôt initial
    let balance = (50000 + Math.floor(Math.random() * 30) * 5000) * 100;
    transactions.push({
      id: uid("tx_"),
      accountId: acc.id,
      type: "deposit",
      amount: balance,
      balanceAfter: balance,
      label: "Dépôt d'ouverture",
      performedBy: operator.id,
      createdAt: acc.createdAt,
    });

    // Quelques mouvements jusqu'à aujourd'hui
    const moves = 3 + Math.floor(Math.random() * 4);
    for (let m = 0; m < moves; m++) {
      const day = Math.max(0, s.opened - Math.floor(((m + 1) / (moves + 1)) * s.opened));
      const isDeposit = Math.random() > 0.4;
      const amount = (5000 + Math.floor(Math.random() * 20) * 2500) * 100;
      if (!isDeposit && amount > balance) continue;
      balance = isDeposit ? balance + amount : balance - amount;
      transactions.push({
        id: uid("tx_"),
        accountId: acc.id,
        type: isDeposit ? "deposit" : "withdrawal",
        amount,
        balanceAfter: balance,
        label: isDeposit ? "Versement" : "Retrait guichet",
        performedBy: operator.id,
        createdAt: daysAgo(day, 9 + m),
      });
    }

    acc.balance = balance;
    accounts.push(acc);
  });

  await repo.seed(users, clients, accounts, transactions);
}
