"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/types";
import {
  fetchProduits,
  createProduit,
  CreateProduitData,
  updateProduitStatus,
  deleteProduit as deleteProduitRequest,
} from "@/lib/api/produits";
import { ApiError } from "@/lib/api/config";

type ListingsContextType = {
  listings: Product[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addListing: (data: CreateProduitData) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (
    id: string,
    status: Product["status"],
  ) => Promise<{ success: boolean; error?: string }>;
  deleteListing: (id: string) => Promise<{ success: boolean; error?: string }>;
};

const ListingsContext = createContext<ListingsContextType>({
  listings: [],
  isLoading: true,
  error: null,
  refresh: async () => {},
  addListing: async () => ({ success: false }),
  updateStatus: async () => ({ success: false }),
  deleteListing: async () => ({ success: false }),
});

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProduits();
      setListings(data);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Impossible de charger les annonces. Le serveur Assigame est-il démarré ?",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addListing = async (data: CreateProduitData) => {
    try {
      const created = await createProduit(data);
      setListings((prev) => [created, ...prev]);
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Impossible de publier l'annonce.";
      return { success: false, error: message };
    }
  };

  const updateStatus = async (id: string, status: Product["status"]) => {
    try {
      const updated = await updateProduitStatus(id, status);
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Impossible de mettre à jour le statut.";
      return { success: false, error: message };
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await deleteProduitRequest(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      return { success: true };
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Impossible de supprimer l'annonce.";
      return { success: false, error: message };
    }
  };

  return (
    <ListingsContext.Provider
      value={{ listings, isLoading, error, refresh, addListing, updateStatus, deleteListing }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export const useListings = () => useContext(ListingsContext);
