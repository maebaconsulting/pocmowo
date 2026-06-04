// Service de gestion de la clientèle et du KYC.
import { z } from "zod";
import type { Client, Gender, IdType, KycStatus } from "@/lib/types";
import { getRepository } from "@/database/repository";
import { uid } from "@/lib/env";

export const createClientSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().min(6, "Téléphone requis"),
  email: z.string().email("Courriel invalide").or(z.literal("")).optional().default(""),
  gender: z.enum(["M", "F"]),
  birthDate: z.string().min(1, "Date de naissance requise"),
  occupation: z.string().optional().default(""),
  idType: z.enum(["cni", "passeport", "permis"]),
  idNumber: z.string().min(3, "Numéro de pièce requis"),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export async function listClients(): Promise<Client[]> {
  const repo = await getRepository();
  return repo.listClients();
}

export async function getClient(id: string): Promise<Client | null> {
  const repo = await getRepository();
  return repo.getClient(id);
}

export async function createClient(input: CreateClientInput, operatorId: string): Promise<Client> {
  const repo = await getRepository();
  const client: Client = {
    id: uid("cli_"),
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() ?? "",
    gender: input.gender as Gender,
    birthDate: input.birthDate,
    occupation: input.occupation?.trim() ?? "",
    idType: input.idType as IdType,
    idNumber: input.idNumber.trim(),
    address: input.address?.trim() ?? "",
    city: input.city?.trim() ?? "",
    kycStatus: "pending",
    createdBy: operatorId,
    createdAt: new Date().toISOString(),
  };
  await repo.createClient(client);
  return client;
}

export async function setKycStatus(id: string, status: KycStatus): Promise<void> {
  const repo = await getRepository();
  await repo.setKycStatus(id, status);
}
