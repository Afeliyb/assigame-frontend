"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useCursor } from "@/components/cursor-provider";
import { useCategories } from "@/components/categories-provider";
import { useAuth } from "@/components/auth-provider";
import { useFavorites } from "@/components/favorites-provider";
import { useRouter } from "next/navigation";

export function ProductCard({ product }: { product: Product }) {
  const { setCursorLabel } = useCursor();
  const { categories } = useCategories();
  const { user } = useAuth();
  const { favoriteIds, toggle } = useFavorites();
  const router = useRouter();

  const category = categories.find((c) => c.id === product.categoryId);
  const isSold = product.status === "Vendu";
  const isLiked = favoriteIds.has(product.id);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Si non connecté → redirige vers la page de connexion
    if (!user) {
      router.push("/auth");
      return;
    }
    await toggle(product.id);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col gap-3"
      onMouseEnter={() => setCursorLabel("Voir")}
      onMouseLeave={() => setCursorLabel(null)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--surface-elevated)]">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Overlay sombre au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider">
              Vendu
            </span>
          </div>
        )}

        {/* Bouton like — toujours visible quand liked, sinon visible au survol */}
        <button
          onClick={handleLike}
          aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isLiked
              ? "opacity-100 bg-red-500/90 text-white scale-100 shadow-lg"
              : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 bg-white/80 dark:bg-black/80 text-black dark:text-white hover:scale-110 shadow-[var(--shadow-elegant)]"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md text-xs font-bold text-black dark:text-white shadow-[var(--shadow-elegant)]">
            {product.price.toLocaleString("fr-FR")} {product.currency}
          </div>
          {product.featured && (
            <div className="px-2 py-0.5 rounded-full bg-[var(--foreground)] text-[var(--background)] text-[9px] font-bold uppercase tracking-wider">
              À la une
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-0.5 px-0.5">
        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-black/60 dark:text-white/60 line-clamp-1">
          {product.condition}
          {category ? ` • ${category.name}` : ""}
        </p>
      </div>
    </Link>
  );
}
