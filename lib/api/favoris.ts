import { apiFetch } from "./config";
import type { ApiProduit } from "./types";
import { mapProduit } from "./adapters";
import type { Product } from "@/lib/types";

type ToggleResult = { liked: boolean; idProduit: number };
type CheckResult = { liked: boolean; idProduit: number };

/**
 * Récupère la liste des produits mis en favori par un utilisateur.
 * Utilisé par la page "Mes favoris" du tableau de bord.
 */
export async function fetchFavoris(userId: string): Promise<Product[]> {
  const data = await apiFetch<ApiProduit[]>(`/favori/list?userId=${userId}`);
  return data.map(mapProduit);
}

/**
 * Toggle like/unlike d'un produit.
 * Retourne { liked: true } si le produit vient d'être ajouté aux favoris,
 * { liked: false } s'il vient d'être retiré.
 */
export async function toggleFavori(
  userId: string,
  produitId: string,
): Promise<ToggleResult> {
  return apiFetch<ToggleResult>(
    `/favori/toggle/${produitId}?userId=${userId}`,
    { method: "POST" },
  );
}

/**
 * Vérifie si un produit est dans les favoris d'un utilisateur.
 * Utilisé à l'ouverture de la fiche produit pour pré-initialiser l'état du bouton like.
 */
export async function checkFavori(
  userId: string,
  produitId: string,
): Promise<boolean> {
  const data = await apiFetch<CheckResult>(
    `/favori/check/${produitId}?userId=${userId}`,
  );
  return data.liked;
}
