// Formatage des montants (centimes XOF) et des dates, en français.

/** Convertit un montant en centimes vers un affichage franc CFA (BEAC / XAF, Afrique centrale). */
export function formatXOF(cents: number): string {
  const value = cents / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Montant compact pour les cartes indicateur (ex. 1,2 M FCFA). */
export function formatXOFCompact(cents: number): string {
  const value = cents / 100;
  return (
    new Intl.NumberFormat("fr-FR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value) + " FCFA"
  );
}

/** Saisie utilisateur (francs) vers centimes. Retourne null si invalide. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Initiales pour les avatars. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
