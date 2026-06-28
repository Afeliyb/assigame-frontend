// Types reflétant exactement le JSON renvoyé par le backend Spring Boot
// (noms de champs identiques aux entités Java, sérialisées par Jackson).

export type ApiTypeUtilisateur = {
  id_typeutilisateur: number;
  nom_typeutilisateur: string;
  description_typeutilisateur?: string | null;
};

export type ApiCategorieProduit = {
  idcategorie_produit: number;
  nom_categorieproduit: string;
  description?: string | null;
  icone?: string | null;
};

export type ApiUtilisateur = {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  telephone?: string | null;
  whatsapp?: string | null;
  localisation?: string | null;
  avatar?: string | null;
  bio?: string | null;
  date_creation: string;
  statut: string;
  typeutilisateur?: ApiTypeUtilisateur | null;
};

export type ApiProduit = {
  id_produit: number;
  nom_produit: string;
  description?: string | null;
  prix: number;
  images: string[];
  date_ajout: string;
  statut: string;
  etat?: string | null;
  vedette: boolean;
  vues: number;
  categorieProduit: ApiCategorieProduit;
  utilisateur: ApiUtilisateur;
};

// Corps envoyés au backend (écriture)

export type ApiProduitInput = {
  nom_produit: string;
  description: string;
  prix: number;
  images: string[];
  etat: string;
  statut?: string;
  vedette?: boolean;
  categorieProduit: { idcategorie_produit: number };
  utilisateur: { id_utilisateur: number };
};

export type ApiRegisterInput = {
  nom: string;
  prenom: string;
  email: string;
  motdepasse: string;
  telephone?: string;
  whatsapp?: string;
  localisation?: string;
};

export type ApiLoginInput = {
  email: string;
  motdepasse: string;
};

export type ApiUtilisateurUpdateInput = Partial<{
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  localisation: string;
  avatar: string;
  bio: string;
  motdepasse: string;
}>;
