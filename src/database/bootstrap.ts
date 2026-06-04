// Amorçage des données : initialise le repository puis insère le jeu de
// démonstration si nécessaire. Single-flight pour éviter tout double-seed
// (React StrictMode exécute les effets deux fois en développement).
import { getRepository } from "./repository";
import { seedIfEmpty } from "./seed";

let bootPromise: Promise<void> | null = null;

export function bootstrapData(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      const repo = await getRepository();
      await seedIfEmpty(repo);
    })();
  }
  return bootPromise;
}
