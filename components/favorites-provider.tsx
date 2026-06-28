"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth-provider";
import { fetchFavoris, toggleFavori } from "@/lib/api/favoris";
import type { Product } from "@/lib/types";

type FavoritesContextType = {
  /** IDs des produits en favori de l'utilisateur connecté */
  favoriteIds: Set<string>;
  /** Liste complète des produits favoris (pour la page Mes favoris) */
  favorites: Product[];
  isLoading: boolean;
  /** Toggle like/unlike. Retourne le nouvel état liked. */
  toggle: (productId: string) => Promise<boolean>;
  /** Recharge la liste depuis l'API */
  refresh: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: new Set(),
  favorites: [],
  isLoading: false,
  toggle: async () => false,
  refresh: async () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchFavoris(user.id);
      setFavorites(data);
    } catch {
      // Silencieux — les favoris ne sont pas critiques pour la navigation
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Charge les favoris dès que l'utilisateur se connecte / change
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const result = await toggleFavori(user.id, productId);
        // Met à jour le state localement sans recharger toute la liste
        setFavorites((prev) => {
          if (result.liked) {
            // On ne peut pas reconstruire l'objet Product complet ici sans appel API,
            // donc on déclenche un refresh en arrière-plan pour synchroniser la liste.
            refresh();
            return prev;
          } else {
            return prev.filter((p) => p.id !== productId);
          }
        });
        return result.liked;
      } catch {
        return false;
      }
    },
    [user, refresh],
  );

  const favoriteIds = new Set(favorites.map((p) => p.id));

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, favorites, isLoading, toggle, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
