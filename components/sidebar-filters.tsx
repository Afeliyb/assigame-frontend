"use client";

import React, { useMemo, useState } from "react";
import {
  RotateCcw, ChevronDown, ChevronUp, MapPin, Tag, Layers,
  ArrowUpDown, CheckSquare, Square, Banknote, Clock, Gem, Eye,
  Laptop, Shirt, Armchair, Dumbbell, Sparkles, BookOpen, Gamepad2, Car, Package,
} from "lucide-react";
import { TogoFlag } from "./flags";
import { useCategories } from "@/components/categories-provider";
import { useListings } from "@/components/listings-provider";
import { useLanguage } from "@/components/language-provider";
import { TOGO_REGIONS } from "@/lib/togo";
import type { Category } from "@/lib/types";
import type { Condition } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Shirt, Armchair, Dumbbell, Sparkles, BookOpen, Gamepad2, Car, Package,
};

function CategoryIcon({ icon, className = "w-4 h-4" }: { icon?: string; className?: string }) {
  const Icon = icon ? (ICON_MAP[icon] ?? Package) : Package;
  return <Icon className={className} />;
}

type Props = {
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  activeCity: string | null;
  onCityChange: (city: string | null) => void;
  activeConditions: Condition[];
  onConditionToggle: (c: Condition) => void;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  sort: string;
  onSortChange: (s: string) => void;
  onReset: () => void;
  onClose?: () => void;
};

const CONDITIONS: Condition[] = ["Neuf", "Très bon état", "Bon état", "Satisfaisant"];

function FilterSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 text-sm font-bold hover:text-[var(--foreground)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 opacity-50" />
          {title}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 opacity-40" />
          : <ChevronDown className="w-3.5 h-3.5 opacity-40" />
        }
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export function SidebarFilters({
  activeCategory, onCategoryChange,
  activeCity, onCityChange,
  activeConditions, onConditionToggle,
  minPrice, maxPrice, onMinPrice, onMaxPrice,
  sort, onSortChange,
  onReset, onClose,
}: Props) {
  const { categories } = useCategories();
  const { listings } = useListings();
  const { t, lang } = useLanguage();
  const [expandedRegion, setExpandedRegion] = useState<string | null>("Maritime");

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    listings.filter((p) => p.status === "En ligne").forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1;
    });
    return map;
  }, [listings]);

  const countByCity = useMemo(() => {
    const map: Record<string, number> = {};
    listings.filter((p) => p.status === "En ligne" && p.seller?.location).forEach((p) => {
      const loc = p.seller!.location.toLowerCase();
      TOGO_REGIONS.flatMap((r) => r.cities).forEach((city) => {
        if (loc.includes(city.toLowerCase())) {
          map[city] = (map[city] || 0) + 1;
        }
      });
    });
    return map;
  }, [listings]);

  const CONDITIONS_LABEL: Record<Condition, string> = {
    "Neuf": lang === "en" ? "New" : "Neuf",
    "Très bon état": lang === "en" ? "Very good" : "Très bon état",
    "Bon état": lang === "en" ? "Good" : "Bon état",
    "Satisfaisant": lang === "en" ? "Fair" : "Satisfaisant",
  };

  const activeFiltersCount = [
    activeCategory, activeCity, ...activeConditions, minPrice, maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{t.filter_title}</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-black/50 dark:text-white/50 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t.filter_reset}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-0 pr-0.5">

        {/* ── CATÉGORIES ── */}
        <FilterSection title={t.filter_category} icon={Layers}>
          <div className="space-y-1">
            <button
              onClick={() => { onCategoryChange(null); onClose?.(); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                !activeCategory
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "hover:bg-[var(--surface-elevated)]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 opacity-60" />
                {t.browse_all}
              </span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                !activeCategory ? "bg-white/20 text-inherit" : "bg-[var(--surface-elevated)]"
              }`}>
                {listings.filter((p) => p.status === "En ligne").length}
              </span>
            </button>

            {categories.map((cat: Category) => {
              const isActive = activeCategory === cat.slug;
              const count = countByCategory[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => { onCategoryChange(isActive ? null : cat.slug); onClose?.(); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "hover:bg-[var(--surface-elevated)] text-black/70 dark:text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <CategoryIcon icon={cat.icon} className="w-4 h-4 opacity-70" />
                    {cat.name}
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20" : "bg-[var(--surface-elevated)]"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ── LOCALISATION ── */}
        <FilterSection title={t.filter_city} icon={MapPin}>
          <div className="space-y-1">
            {/* Tout le Togo */}
            <button
              onClick={() => onCityChange(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                !activeCity
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "hover:bg-[var(--surface-elevated)] text-black/70 dark:text-white/70"
              }`}
            >
              <TogoFlag className="w-4 h-3" />
              {t.filter_all_cities}
            </button>

            {/* Régions */}
            {TOGO_REGIONS.map((region) => {
              const regionCount = region.cities.reduce(
                (s, c) => s + (countByCity[c] || 0), 0
              );
              if (regionCount === 0) return null;
              const isExpanded = expandedRegion === region.name;

              return (
                <div key={region.name}>
                  <button
                    onClick={() => setExpandedRegion(isExpanded ? null : region.name)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  >
                    <span>{region.name}</span>
                    <span className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold normal-case tracking-normal">{regionCount}</span>
                      {isExpanded
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                      }
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-0.5 ml-2">
                      {region.cities.map((city) => {
                        const count = countByCity[city] || 0;
                        if (count === 0) return null;
                        const isActive = activeCity === city;
                        return (
                          <button
                            key={city}
                            onClick={() => { onCityChange(isActive ? null : city); onClose?.(); }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                              isActive
                                ? "bg-[var(--foreground)] text-[var(--background)] font-semibold"
                                : "hover:bg-[var(--surface-elevated)] text-black/60 dark:text-white/60"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 opacity-40" />
                              {city}
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                              isActive ? "bg-white/20" : "bg-[var(--surface-elevated)]"
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FilterSection>

        {/* ── PRIX ── */}
        <FilterSection title={t.filter_price} icon={Banknote}>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              placeholder={t.filter_price_min}
              className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--surface-elevated)] outline-none border border-transparent focus:border-[var(--border-subtle)] font-medium"
            />
            <span className="text-black/30 dark:text-white/30 shrink-0">–</span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              placeholder={t.filter_price_max}
              className="w-full px-3 py-2 rounded-xl text-sm bg-[var(--surface-elevated)] outline-none border border-transparent focus:border-[var(--border-subtle)] font-medium"
            />
          </div>
          <p className="text-[10px] text-black/30 dark:text-white/30 mt-2 flex items-center gap-1">
            <Banknote className="w-3 h-3" />
            en FCFA · 1 000 FCFA ≈ 1,5 €
          </p>

          {/* Presets rapides */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              { label: "< 10 000", max: "10000" },
              { label: "< 50 000", max: "50000" },
              { label: "< 100 000", max: "100000" },
              { label: "< 500 000", max: "500000" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => { onMinPrice(""); onMaxPrice(preset.max); }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  maxPrice === preset.max && !minPrice
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--surface-elevated)] hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ── ÉTAT ── */}
        <FilterSection title={t.filter_condition} icon={CheckSquare}>
          <div className="space-y-1.5">
            {CONDITIONS.map((c) => {
              const isActive = activeConditions.includes(c);
              const count = listings.filter(
                (p) => p.status === "En ligne" && p.condition === c
              ).length;
              return (
                <button
                  key={c}
                  onClick={() => onConditionToggle(c)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[var(--foreground)] text-[var(--background)] font-semibold"
                      : "hover:bg-[var(--surface-elevated)] text-black/70 dark:text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4 opacity-30" />
                    }
                    {CONDITIONS_LABEL[c]}
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white/20" : "bg-[var(--surface-elevated)]"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ── TRI ── */}
        <FilterSection title={t.filter_sort} icon={ArrowUpDown} defaultOpen={false}>
          <div className="space-y-1">
            {[
              { value: "recent",     label: t.filter_sort_recent,    icon: Clock },
              { value: "price-asc",  label: t.filter_sort_price_asc, icon: Banknote },
              { value: "price-desc", label: t.filter_sort_price_desc, icon: Gem },
              { value: "views",      label: t.filter_sort_views,     icon: Eye },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onSortChange(value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  sort === value
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "hover:bg-[var(--surface-elevated)] text-black/70 dark:text-white/70"
                }`}
              >
                <Icon className="w-4 h-4 opacity-70" />
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ── ENCART TOGO ── */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2.5">
            <TogoFlag className="w-6 h-4" />
            <span className="text-xs font-bold">République Togolaise</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-black/50 dark:text-white/50">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3" />
              Indicatif : +228
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="w-3 h-3" />
              Monnaie : FCFA (XOF)
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Lomé · Kara · Atakpamé · +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
