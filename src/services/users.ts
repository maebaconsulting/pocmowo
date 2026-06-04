// Service de gestion des utilisateurs internes.
import { z } from "zod";
import type { SafeUser, User, UserRole } from "@/lib/types";
import { getRepository } from "@/database/repository";
import { uid } from "@/lib/env";
import { hashPassword, toSafeUser } from "./auth";

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Courriel invalide"),
  role: z.enum(["admin", "agent"]),
  password: z.string().min(6, "6 caractères minimum"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export async function listUsers(): Promise<SafeUser[]> {
  const repo = await getRepository();
  const users = await repo.listUsers();
  return users.map(toSafeUser);
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const repo = await getRepository();
  const existing = await repo.getUserByEmail(input.email);
  if (existing) throw new Error("Ce courriel est déjà utilisé.");

  const user: User = {
    id: uid("usr_"),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role as UserRole,
    status: "active",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await repo.createUser(user);
  return toSafeUser(user);
}

export async function toggleUserStatus(id: string, current: SafeUser["status"]): Promise<void> {
  const repo = await getRepository();
  await repo.setUserStatus(id, current === "active" ? "suspended" : "active");
}
