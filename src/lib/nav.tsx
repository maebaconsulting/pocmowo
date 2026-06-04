// Navigation de l'application — source unique alimentant la sidebar, les titres
// de la barre supérieure et la génération des routes. Les modules « à venir »
// (soon) illustrent la vision core banking complète sans page blanche en démo.
import type { ReactNode } from "react";
import {
  IconDashboard,
  IconWallet,
  IconTransactions,
  IconCash,
  IconTransfer,
  IconClient,
  IconGroup,
  IconPiggy,
  IconCredit,
  IconSchedule,
  IconReport,
  IconShield,
  IconUsers,
  IconBuilding,
  IconSettings,
} from "./icons";

export interface NavItem {
  to: string;
  label: string;
  subtitle: string;
  icon: ReactNode;
  placeholder?: boolean; // module présenté en aperçu (pas encore implémenté)
  adminOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Pilotage",
    items: [
      { to: "/", label: "Tableau de bord", subtitle: "Vue d'ensemble de l'activité", icon: <IconDashboard /> },
      { to: "/reporting", label: "Reporting", subtitle: "États réglementaires BCEAO et indicateurs", icon: <IconReport />, placeholder: true },
    ],
  },
  {
    title: "Opérations",
    items: [
      { to: "/comptes", label: "Comptes", subtitle: "Gestion des comptes clients", icon: <IconWallet /> },
      { to: "/transactions", label: "Transactions", subtitle: "Historique des opérations", icon: <IconTransactions /> },
      { to: "/caisse", label: "Caisse", subtitle: "Sessions de caisse et arrêtés de guichet", icon: <IconCash />, placeholder: true },
      { to: "/virements", label: "Virements", subtitle: "Transferts de compte à compte", icon: <IconTransfer />, placeholder: true },
    ],
  },
  {
    title: "Clientèle",
    items: [
      { to: "/clients", label: "Clients", subtitle: "Dossiers clients et conformité KYC", icon: <IconClient /> },
      { to: "/groupes", label: "Groupes", subtitle: "Groupes solidaires et tontines", icon: <IconGroup />, placeholder: true },
      { to: "/epargne", label: "Épargne", subtitle: "Catalogue des produits d'épargne", icon: <IconPiggy />, placeholder: true },
    ],
  },
  {
    title: "Crédit",
    items: [
      { to: "/credits", label: "Prêts", subtitle: "Octroi et suivi des microcrédits", icon: <IconCredit />, placeholder: true },
      { to: "/echeanciers", label: "Échéances", subtitle: "Remboursements et gestion des impayés", icon: <IconSchedule />, placeholder: true },
    ],
  },
  {
    title: "Administration",
    items: [
      { to: "/utilisateurs", label: "Utilisateurs", subtitle: "Personnel de l'établissement", icon: <IconUsers />, adminOnly: true },
      { to: "/agences", label: "Agences", subtitle: "Points de service et réseau d'agents", icon: <IconBuilding />, placeholder: true, adminOnly: true },
      { to: "/conformite", label: "Conformité", subtitle: "Maker-checker et piste d'audit", icon: <IconShield />, placeholder: true },
      { to: "/parametres", label: "Paramètres", subtitle: "Configuration de l'établissement", icon: <IconSettings />, placeholder: true },
    ],
  },
];

// Index pratique : tous les items à plat, et la table des titres par chemin.
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const NAV_TITLES: Record<string, { title: string; subtitle: string }> = Object.fromEntries(
  NAV_ITEMS.map((i) => [i.to, { title: i.label, subtitle: i.subtitle }]),
);

export const PLACEHOLDER_ITEMS: NavItem[] = NAV_ITEMS.filter((i) => i.placeholder);
