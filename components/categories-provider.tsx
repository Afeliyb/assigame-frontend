"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { fetchCategories } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/config";

type CategoriesContextType = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

const CategoriesContext = createContext<CategoriesContextType>({
  categories: [],
  isLoading: true,
  error: null,
});

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger les catégories.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
