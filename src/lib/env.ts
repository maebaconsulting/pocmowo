// Détection de l'environnement d'exécution : desktop Tauri ou navigateur web.

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Génère un identifiant unique simple (suffisant pour un POC local). */
export function uid(prefix = ""): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${time}${rnd}`;
}
