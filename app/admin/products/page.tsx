"use client";

// app/admin/products/page.tsx
// Liste complète des produits avec : filtre par statut, recherche,
// changement de statut inline, toggle vedette, suppression.

import React, { useEffect, useState, useMemo } from "react";
import { Search, Trash2, Star } from "lucide-react";
import {
  adminFetchAllProduits,
  adminUpdateProduitStatut,
  adminToggleVedette,
  adminDeleteProduit,
} from "@/lib/api/admin";
import type { Product } from "@/lib/types";

type StatusFilter = "Tous" | "En ligne" | "Vendu" | "Hors ligne";
const STATUS_FILTERS: StatusFilter[] = [
  "Tous",
  "En ligne",
  "Vendu",
  "Hors ligne",
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("Tous");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    adminFetchAllProduits()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((p) => filter === "Tous" || p.status === filter)
      .filter(
        (p) => p.title.toLowerCase().includes(q) || String(p.price).includes(q),
      );
  }, [products, filter, search]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleStatus = async (
    id: string,
    statut: "En ligne" | "Vendu" | "Hors ligne",
  ) => {
    setBusyId(id);
    try {
      const updated = await adminUpdateProduitStatut(id, statut);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } finally {
      setBusyId(null);
    }
  };

  const handleVedette = async (id: string, current: boolean) => {
    setBusyId(id);
    try {
      const updated = await adminToggleVedette(id, !current);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ? Cette action est irréversible."))
      return;
    setBusyId(id);
    try {
      await adminDeleteProduit(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">Produits</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          {products.length} annonces · {filtered.length} affichées
        </p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === s
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                  : "border-[var(--border-subtle)] text-black/60 dark:text-white/60 hover:border-[var(--foreground)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
                {["Produit", "Vendeur", "Prix", "Statut", "Vues", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className={`text-left p-3 font-bold text-[11px] text-black/40 dark:text-white/40 uppercase tracking-wider ${
                        h === "Vendeur"
                          ? "hidden sm:table-cell"
                          : h === "Prix"
                            ? "hidden lg:table-cell"
                            : h === "Vues"
                              ? "hidden md:table-cell"
                              : ""
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const busy = busyId === p.id;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-elevated)]/40 transition-colors ${busy ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Produit */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 shrink-0">
                          {p.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate max-w-[150px] sm:max-w-[200px]">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-black/40 dark:text-white/40">
                            {p.condition}
                          </p>
                          {p.featured && (
                            <span className="text-[9px] font-black text-yellow-500">
                              ★ À la une
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vendeur */}
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-xs text-black/60 dark:text-white/60 truncate block max-w-[120px]">
                        {p.seller?.name || "—"}
                      </span>
                    </td>

                    {/* Prix */}
                    <td className="p-3 hidden lg:table-celll whitespace-nowrap">
                      <span className="font-bold text-xs">
                        {p.price.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-black/40 dark:text-white/40 text-xs">
                        {" "}
                        FCFA
                      </span>
                    </td>

                    {/* Statut — select inline */}
                    <td className="p-3">
                      <select
                        value={p.status}
                        disabled={busy}
                        onChange={(e) =>
                          handleStatus(
                            p.id,
                            e.target.value as
                              | "En ligne"
                              | "Vendu"
                              | "Hors ligne",
                          )
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border-0 outline-none cursor-pointer appearance-none ${
                          p.status === "En ligne"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : p.status === "Vendu"
                              ? "bg-orange-500/15 text-orange-600"
                              : "bg-red-500/15 text-red-500"
                        }`}
                      >
                        <option value="En ligne">En ligne</option>
                        <option value="Vendu">Vendu</option>
                        <option value="Hors ligne">Hors ligne</option>
                      </select>
                    </td>

                    {/* Vues */}
                    <td className="p-3 hidden md:table-cell text-xs text-black/50 dark:text-white/50">
                      {(p.views ?? 0).toLocaleString("fr-FR")}
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Toggle vedette */}
                        <button
                          onClick={() => handleVedette(p.id, !!p.featured)}
                          disabled={busy}
                          title={
                            p.featured ? "Retirer de la une" : "Mettre à la une"
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.featured
                              ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
                              : "text-black/25 dark:text-white/25 hover:bg-[var(--surface-elevated)] hover:text-yellow-500"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>

                        {/* Supprimer */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={busy}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-sm text-black/40 dark:text-white/40"
                  >
                    Aucun produit correspondant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
