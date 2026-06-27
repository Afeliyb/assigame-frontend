"use client";

import React from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { Reveal } from "@/components/animated-text";
import { ProductCard } from "@/components/product-card";
import { useFavorites } from "@/components/favorites-provider";

export default function DashboardFavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="max-w-5xl">
      <Reveal>
        <div className="flex items-end gap-4 mb-2">
          <h1 className="font-display font-black text-4xl">Mes favoris</h1>
          {favorites.length > 0 && (
            <span className="mb-1.5 text-black/40 dark:text-white/40 font-bold text-lg">
              {favorites.length}
            </span>
          )}
        </div>
        <p className="text-black/60 dark:text-white/60 mb-10">
          Les articles que vous avez enregistrés d&apos;un coup de cœur.
        </p>

        {isLoading && (
          <div className="flex justify-center p-16">
            <Loader2 className="w-7 h-7 animate-spin opacity-50" />
          </div>
        )}

        {!isLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center">
              <Heart className="w-7 h-7 opacity-30" />
            </div>
            <div>
              <p className="font-bold text-lg mb-1">Aucun favori pour l&apos;instant</p>
              <p className="text-sm text-black/60 dark:text-white/60 max-w-xs mx-auto">
                Cliquez sur le cœur ❤ d&apos;une annonce pour la retrouver ici.
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorer les annonces
            </Link>
          </div>
        )}

        {!isLoading && favorites.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
