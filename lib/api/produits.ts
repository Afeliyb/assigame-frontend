import { apiFetch } from "./config";
import type { ApiProduit, ApiProduitInput } from "./types";
import { mapProduit } from "./adapters";
import type { Product } from "@/lib/types";

export async function fetchProduits(filters?: {
  categorieId?: string;
  vendeurId?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.categorieId) params.set("categorieId", filters.categorieId);
  if (filters?.vendeurId) params.set("vendeurId", filters.vendeurId);
  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await apiFetch<ApiProduit[]>(`/produit/list${query}`);
  return data.map(mapProduit);
}

export async function fetchProduitsVedettes(): Promise<Product[]> {
  const data = await apiFetch<ApiProduit[]>(`/produit/vedettes`);
  return data.map(mapProduit);
}

export async function fetchProduitById(id: string): Promise<Product> {
  const data = await apiFetch<ApiProduit>(`/produit/${id}`);
  return mapProduit(data);
}

export async function fetchProduitsByVendeur(vendeurId: string): Promise<Product[]> {
  return fetchProduits({ vendeurId });
}

export async function incrementerVuesProduit(id: string): Promise<void> {
  try {
    await apiFetch<ApiProduit>(`/produit/${id}/vue`, { method: "POST" });
  } catch {
    // Le comptage de vues n'est pas critique : on ignore silencieusement les erreurs réseau.
  }
}

export type CreateProduitData = {
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  categoryId: string;
  sellerId: string;
};

export async function createProduit(payload: CreateProduitData): Promise<Product> {
  const body: ApiProduitInput = {
    nom_produit: payload.title,
    description: payload.description,
    prix: payload.price,
    images: payload.images,
    etat: payload.condition,
    categorieProduit: { idcategorie_produit: Number(payload.categoryId) },
    utilisateur: { id_utilisateur: Number(payload.sellerId) },
  };
  const data = await apiFetch<ApiProduit>(`/produit/add`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapProduit(data);
}

export async function updateProduit(
  id: string,
  payload: Partial<CreateProduitData>,
): Promise<Product> {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.nom_produit = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.price !== undefined) body.prix = payload.price;
  if (payload.images !== undefined) body.images = payload.images;
  if (payload.condition !== undefined) body.etat = payload.condition;
  if (payload.categoryId !== undefined) {
    body.categorieProduit = { idcategorie_produit: Number(payload.categoryId) };
  }
  const data = await apiFetch<ApiProduit>(`/produit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapProduit(data);
}

export async function updateProduitStatus(
  id: string,
  status: Product["status"],
): Promise<Product> {
  const data = await apiFetch<ApiProduit>(`/produit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ statut: status }),
  });
  return mapProduit(data);
}

export async function deleteProduit(id: string): Promise<void> {
  await apiFetch<void>(`/produit/delete/${id}`, { method: "DELETE" });
}
