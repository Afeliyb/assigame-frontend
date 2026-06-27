import { apiFetch } from "./config";
import type {
  ApiLoginInput,
  ApiRegisterInput,
  ApiUtilisateur,
  ApiUtilisateurUpdateInput,
} from "./types";
import type { AuthUser, Seller } from "@/lib/types";
import { mapSeller } from "./adapters";

export function mapAuthUser(u: ApiUtilisateur): AuthUser {
  return {
    id: String(u.id_utilisateur),
    name: `${u.prenom} ${u.nom}`.trim(),
    firstName: u.prenom,
    lastName: u.nom,
    email: u.email,
    phone: u.telephone || undefined,
    location: u.localisation || undefined,
    whatsapp: u.whatsapp || undefined,
    avatar: u.avatar || undefined,
    bio: u.bio || undefined,
  };
}

export async function loginRequest(email: string, password: string): Promise<AuthUser> {
  const body: ApiLoginInput = { email, motdepasse: password };
  const data = await apiFetch<ApiUtilisateur>(`/utilisateur/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapAuthUser(data);
}

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
};

export async function registerRequest(payload: RegisterData): Promise<AuthUser> {
  const body: ApiRegisterInput = {
    nom: payload.lastName,
    prenom: payload.firstName,
    email: payload.email,
    motdepasse: payload.password,
    telephone: payload.phone,
    whatsapp: payload.whatsapp,
    localisation: payload.location,
  };
  const data = await apiFetch<ApiUtilisateur>(`/utilisateur/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapAuthUser(data);
}

export async function fetchUtilisateurById(id: string): Promise<AuthUser> {
  const data = await apiFetch<ApiUtilisateur>(`/utilisateur/${id}`);
  return mapAuthUser(data);
}

/** Variante publique utilisée par la page profil vendeur (/seller/[id]) et la modale de contact. */
export async function fetchSellerById(id: string): Promise<Seller> {
  const data = await apiFetch<ApiUtilisateur>(`/utilisateur/${id}`);
  return mapSeller(data);
}

export async function updateUtilisateur(
  id: string,
  payload: ApiUtilisateurUpdateInput,
): Promise<AuthUser> {
  const data = await apiFetch<ApiUtilisateur>(`/utilisateur/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapAuthUser(data);
}
