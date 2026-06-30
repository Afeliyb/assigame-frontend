"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, Loader2, X, AlertTriangle, Grid3X3, List, Search, MapPin } from "lucide-react";
import { useListings } from "@/components/listings-provider";
import { useCategories } from "@/components/categories-provider";
import { useLanguage } from "@/components/language-provider";
import { useLocation } from "@/components/location-provider";
import { SidebarFilters } from "@/components/sidebar-filters";
import { ProductCard } from "@/components/product-card";
import type { Condition } from "@/lib/types";
import { extractCityFromLocation } from "@/lib/togo";

type SortOption = "recent" | "price-asc" | "price-desc" | "views";

function BrowseContent() {
  const searchParams = useSearchParams();
  const { listings, isLoading, error } = useListings();
  const { categories } = useCategories();
  const { t } = useLanguage();
  const { selectedCity } = useLocation();

  const initCategory = searchParams.get("category");
  const initQuery    = searchParams.get("q") ?? "";
  const initCity     = searchParams.get("city");

  const [activeCategory, setActiveCategory]   = useState<string | null>(initCategory);
  const [activeCity, setActiveCity]           = useState<string | null>(initCity ?? selectedCity);
  const [query, setQuery]                     = useState(initQuery);
  const [activeConditions, setActiveConditions] = useState<Condition[]>([]);
  const [minPrice, setMinPrice]               = useState("");
  const [maxPrice, setMaxPrice]               = useState("");
  const [sort, setSort]                       = useState<SortOption>("recent");
  const [sidebarOpen, setSidebarOpen]         = useState(false); // mobile drawer
  const [viewMode, setViewMode]               = useState<"grid" | "list">("grid");

  // Synchronise la ville de la navbar → filtre local (sauf si une ville est déjà dans l'URL)
  useEffect(() => { if (!initCity) setActiveCity(selectedCity); }, [selectedCity, initCity]);
  useEffect(() => { if (initCategory) setActiveCategory(initCategory); }, [initCategory]);
  useEffect(() => { setQuery(initQuery); }, [initQuery]);

  const toggleCondition = (c: Condition) =>
    setActiveConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const handleReset = () => {
    setActiveCategory(null);
    setActiveCity(null);
    setActiveConditions([]);
    setMinPrice("");
    setMaxPrice("");
    setSort("recent");
  };

  const activeFilterCount = [
    activeCategory, activeCity, ...activeConditions, minPrice, maxPrice,
  ].filter(Boolean).length;

  const displayProducts = useMemo(() => {
    let result = listings.filter((p) => p.status === "En ligne");

    if (activeCategory) {
      const cat = categories.find((c) => c.slug === activeCategory);
      if (cat) result = result.filter((p) => p.categoryId === cat.id);
    }

    if (activeCity) {
      result = result.filter((p) => {
        const loc = p.seller?.location || "";
        return loc.toLowerCase().includes(activeCity.toLowerCase());
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (activeConditions.length > 0) {
      result = result.filter((p) => activeConditions.includes(p.condition));
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) result = result.filter((p) => p.price <= max);
    }

    return [...result].sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "views")      return (b.views ?? 0) - (a.views ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, activeCategory, activeCity, categories, query, activeConditions, minPrice, maxPrice, sort]);

  return (
    <div className="flex gap-0 w-full min-h-screen">
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-[var(--border-subtle)] p-5 pt-6 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto">
        <SidebarFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeCity={activeCity}
          onCityChange={setActiveCity}
          activeConditions={activeConditions}
          onConditionToggle={toggleCondition}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPrice={setMinPrice}
          onMaxPrice={setMaxPrice}
          sort={sort}
          onSortChange={(s) => setSort(s as SortOption)}
          onReset={handleReset}
        />
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="flex-1 min-w-0 px-4 sm:px-6 pt-6 pb-20">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-black text-3xl lg:text-4xl mb-1">
              {activeCategory
                ? categories.find((c) => c.slug === activeCategory)?.name ?? t.browse_title
                : t.browse_title}
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50 flex items-center gap-1.5">
              {activeCity && (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-semibold text-black dark:text-white">{activeCity}</span>
                  <span>·</span>
                </>
              )}
              {isLoading ? "..." : `${displayProducts.length} ${t.filter_results}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Recherche inline mobile */}
            <div className="relative sm:hidden flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[var(--surface-elevated)] text-sm outline-none"
              />
            </div>

            {/* Vue Grid/List */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--surface-elevated)] rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-[var(--foreground)] text-[var(--background)]" : "opacity-50 hover:opacity-80"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-[var(--foreground)] text-[var(--background)]" : "opacity-50 hover:opacity-80"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filtres mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeFilterCount > 0
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--surface-elevated)] hover:opacity-80"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Chips des filtres actifs */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeCity && (
              <button
                onClick={() => setActiveCity(null)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xs font-bold"
              >
                🇹🇬 {activeCity} <X className="w-3 h-3" />
              </button>
            )}
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--foreground)] text-[var(--background)] rounded-full text-xs font-bold"
              >
                {categories.find((c) => c.slug === activeCategory)?.name}
                <X className="w-3 h-3" />
              </button>
            )}
            {activeConditions.map((c) => (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-elevated)] rounded-full text-xs font-semibold border border-[var(--border-subtle)]"
              >
                {c} <X className="w-3 h-3" />
              </button>
            ))}
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface-elevated)] rounded-full text-xs font-semibold border border-[var(--border-subtle)]"
              >
                {minPrice && `${Number(minPrice).toLocaleString("fr-FR")} FCFA`}
                {minPrice && maxPrice && " – "}
                {maxPrice && `${Number(maxPrice).toLocaleString("fr-FR")} FCFA`}
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* États */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin opacity-40" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 text-red-500 mb-6">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && displayProducts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <p className="font-bold text-lg">{t.browse_no_result}</p>
              <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                Essayez d'autres filtres ou explorez toutes les catégories.
              </p>
            </div>
            <button onClick={handleReset} className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Grille produits */}
        {!isLoading && !error && displayProducts.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 md:gap-4">
                {displayProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.04 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Vue liste */
              <div className="flex flex-col gap-3">
                {displayProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.03 }}
                  >
                    <a
                      href={`/product/${p.id}`}
                      className="flex items-center gap-4 p-3 bg-[var(--surface-elevated)] rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-[var(--border-subtle)]"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--background)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{p.title}</p>
                        <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">
                          {p.condition}
                          {categories.find((c) => c.id === p.categoryId) && ` · ${categories.find((c) => c.id === p.categoryId)?.name}`}
                          {p.seller?.location && ` · ${p.seller.location}`}
                        </p>
                        {p.description && (
                          <p className="text-xs text-black/40 dark:text-white/40 mt-1 line-clamp-1">{p.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-base">{p.price.toLocaleString("fr-FR")}</p>
                        <p className="text-[10px] text-black/40 dark:text-white/40">FCFA</p>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SIDEBAR MOBILE DRAWER ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="relative w-80 max-w-[90vw] bg-[var(--background)] flex flex-col h-full shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                <span className="font-bold">Filtres</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-[var(--surface-elevated)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarFilters
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  activeCity={activeCity}
                  onCityChange={setActiveCity}
                  activeConditions={activeConditions}
                  onConditionToggle={toggleCondition}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPrice={setMinPrice}
                  onMaxPrice={setMaxPrice}
                  sort={sort}
                  onSortChange={(s) => setSort(s as SortOption)}
                  onReset={handleReset}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
              <div className="p-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold"
                >
                  Voir {displayProducts.length} résultat{displayProducts.length > 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pt-[88px]">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin opacity-40" /></div>}>
        <BrowseContent />
      </Suspense>
    </div>
  );
}
