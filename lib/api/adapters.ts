import type { Category, Condition, Product, ProductStatus, Seller } from "@/lib/types";
import type { ApiCategorieProduit, ApiProduit, ApiUtilisateur } from "./types";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function mapCategorie(c: ApiCategorieProduit): Category {
  return {
    id: String(c.idcategorie_produit),
    name: c.nom_categorieproduit,
    slug: slugify(c.nom_categorieproduit),
    icon: c.icone ?? undefined,
  };
}

export function mapSeller(u: ApiUtilisateur): Seller {
  return {
    id: String(u.id_utilisateur),
    name: `${u.prenom} ${u.nom}`.trim(),
    location: u.localisation || "Lomé, Togo",
    avatar: u.avatar || undefined,
    joinedAt: u.date_creation,
    bio: u.bio || undefined,
    // phone & whatsapp exclus intentionnellement :
    // ils ne doivent pas transiter dans les réponses publiques des produits.
    // Utiliser fetchContactInfo() (endpoint /contact, réservé aux utilisateurs connectés).
  };
}

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80";

export function mapProduit(p: ApiProduit): Product {
  return {
    id: String(p.id_produit),
    title: p.nom_produit,
    description: p.description || "",
    price: p.prix,
    currency: "FCFA",
    categoryId: String(p.categorieProduit.idcategorie_produit),
    condition: (p.etat as Condition) || "Bon état",
    images: p.images && p.images.length > 0 ? p.images : [DEFAULT_PRODUCT_IMAGE],
    sellerId: String(p.utilisateur.id_utilisateur),
    seller: mapSeller(p.utilisateur),
    createdAt: p.date_ajout,
    status: (p.statut as ProductStatus) || "En ligne",
    featured: p.vedette,
    views: p.vues,
  };
}

/**
 * Reconstitue, à partir d'une liste de produits venant de l'API, la map de vendeurs
 * (utile pour afficher nom/avatar/localisation sans appel supplémentaire).
 */
export function extractSellersFromProduits(produits: ApiProduit[]): Record<string, Seller> {
  const sellers: Record<string, Seller> = {};
  for (const p of produits) {
    const seller = mapSeller(p.utilisateur);
    sellers[seller.id] = seller;
  }
  return sellers;
}
