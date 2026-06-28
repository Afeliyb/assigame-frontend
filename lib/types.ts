// Types métier partagés par l'application. Auparavant définis dans lib/mock/*,
// ils sont maintenant alimentés par de vraies données venant du backend Spring Boot
// (voir lib/api/adapters.ts pour la conversion JSON backend -> types ci-dessous).

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
};

export type Condition = "Neuf" | "Très bon état" | "Bon état" | "Satisfaisant";
export type ProductStatus = "En ligne" | "Vendu" | "Hors ligne";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: Condition;
  images: string[];
  sellerId: string;
  /** Le vendeur est inclus directement dans la réponse de l'API produit (pas d'appel réseau supplémentaire nécessaire). */
  seller?: Seller;
  createdAt: string;
  status: ProductStatus;
  featured?: boolean;
  views?: number;
};

export type Seller = {
  id: string;
  name: string;
  location: string;
  /** Non disponible tant qu'il n'y a pas de système d'avis réel côté backend. */
  rating?: number;
  reviewsCount?: number;
  avatar?: string;
  joinedAt: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
};

export type AuthUser = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  whatsapp?: string;
  avatar?: string;
  bio?: string;
};

// ============================================================
// MESSAGERIE INTERNE
// ============================================================

/** Un message individuel, tel que renvoyé par /api/message/conversation */
export type Message = {
  id_message: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  expediteur_id: number;
  expediteur_nom: string;
  expediteur_prenom: string;
  expediteur_avatar?: string;
  destinataire_id: number;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_avatar?: string;
  produit_ref_id?: number;
  produit_ref_nom?: string;
  produit_ref_image?: string;
};

/** Résumé d'une conversation pour la boîte de réception (/api/message/inbox) */
export type ConversationSummary = {
  interlocuteur_id: number;
  interlocuteur_nom: string;
  interlocuteur_prenom: string;
  interlocuteur_avatar?: string;
  dernier_message: string;
  date_dernier_message: string;
  non_lus: number;
  produit_ref_id?: number;
  produit_ref_nom?: string;
  produit_ref_image?: string;
};
