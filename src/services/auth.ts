// Service d'authentification. POC : empreinte SHA-256 (non destinée à la production).
import type { SafeUser } from "@/lib/types";
import { getRepository } from "@/database/repository";
import { sha256Hex } from "@/lib/sha256";

// Empreinte SHA-256 en JS pur : fonctionne aussi bien dans le navigateur que
// dans la WebView Tauri (où crypto.subtle est indisponible hors contexte sécurisé).
export async function hashPassword(plain: string): Promise<string> {
  return sha256Hex(`mowobank::${plain}`);
}

export function toSafeUser(user: { passwordHash: string } & SafeUser): SafeUser {
  const { ...safe } = user;
  delete (safe as Partial<typeof user>).passwordHash;
  return safe;
}

export interface LoginResult {
  ok: boolean;
  user?: SafeUser;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const repo = await getRepository();
  const user = await repo.getUserByEmail(email.trim());
  if (!user) return { ok: false, error: "Identifiants incorrects." };
  if (user.status === "suspended") return { ok: false, error: "Ce compte est suspendu." };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: "Identifiants incorrects." };
  return { ok: true, user: toSafeUser(user) };
}
