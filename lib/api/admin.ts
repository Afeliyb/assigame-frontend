// lib/api/admin.ts
// Fonctions réservées au panneau d'administration.
// Utilise les mêmes endpoints Spring Boot que le reste de l'app,
// mais regroupés ici pour garder une séparation claire des responsabilités.

import { apiFetch } from "./config";
import type { ApiProduit, ApiUtilisateur } from "./types";
import { mapProduit } from "./adapters";
import { mapAuthUser } from "./utilisateurs";
import type { Product, AuthUser } from "@/lib/types";

// ── Produits ──────────────────────────────────────────────────────────────────

export async function adminFetchAllProduits(): Promise<Product[]> {
  const data = await apiFetch<ApiProduit[]>("/produit/list");
  return data.map(mapProduit);
}

export async function adminUpdateProduitStatut(
  id: string,
  statut: "En ligne" | "Vendu" | "Hors ligne"
): Promise<Product> {
  const data = await apiFetch<ApiProduit>(`/produit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ statut }),
  });
  return mapProduit(data);
}

export async function adminToggleVedette(
  id: string,
  vedette: boolean
): Promise<Product> {
  const data = await apiFetch<ApiProduit>(`/produit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ vedette }),
  });
  return mapProduit(data);
}

export async function adminDeleteProduit(id: string): Promise<void> {
  await apiFetch<void>(`/produit/delete/${id}`, { method: "DELETE" });
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────

export async function adminFetchAllUtilisateurs(): Promise<AuthUser[]> {
  const data = await apiFetch<ApiUtilisateur[]>("/utilisateur/list");
  return data.map(mapAuthUser);
}

export async function adminDeleteUtilisateur(id: string): Promise<void> {
  await apiFetch<void>(`/utilisateur/delete/${id}`, { method: "DELETE" });
}

// ── Catégories ────────────────────────────────────────────────────────────────

export type Category = {
  id: number;
  name: string;
  description?: string;
  icon?: string;
};

function mapCategory(c: import("./types").ApiCategorieProduit): Category {
  return {
    id: c.idcategorie_produit,
    name: c.nom_categorieproduit,
    description: c.description ?? undefined,
    icon: c.icone ?? undefined,
  };
}

export async function adminFetchAllCategories(): Promise<Category[]> {
  const data = await apiFetch<import("./types").ApiCategorieProduit[]>("/categorieproduit/list");
  return data.map(mapCategory);
}

export async function adminCreateCategory(input: {
  name: string;
  description?: string;
  icon?: string;
}): Promise<Category> {
  const data = await apiFetch<import("./types").ApiCategorieProduit>("/categorieproduit/add", {
    method: "POST",
    body: JSON.stringify({
      nom_categorieproduit: input.name,
      description: input.description,
      icone: input.icon,
    }),
  });
  return mapCategory(data);
}

export async function adminUpdateCategory(
  id: number,
  input: { name?: string; description?: string; icon?: string }
): Promise<Category> {
  const data = await apiFetch<import("./types").ApiCategorieProduit>(`/categorieproduit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nom_categorieproduit: input.name,
      description: input.description,
      icone: input.icon,
    }),
  });
  return mapCategory(data);
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await apiFetch<void>(`/categorieproduit/delete/${id}`, { method: "DELETE" });
}