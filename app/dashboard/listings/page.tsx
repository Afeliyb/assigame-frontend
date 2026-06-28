"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useListings } from "@/components/listings-provider";
import { Reveal } from "@/components/animated-text";
import { Edit, Trash2, Loader2, Plus } from "lucide-react";
import { Product } from "@/lib/types";

export default function DashboardListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings, isLoading, error, updateStatus, deleteListing } =
    useListings();
  const [filter, setFilter] = useState<Product["status"] | "Tout">("Tout");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!user) return null;

  const myListings = listings.filter((l) => l.sellerId === user.id);
  const displayListings =
    filter === "Tout"
      ? myListings
      : myListings.filter((l) => l.status === filter);

  const handleStatusChange = async (id: string, status: Product["status"]) => {
    setPendingId(id);
    setActionError(null);
    const result = await updateStatus(id, status);
    if (!result.success) setActionError(result.error ?? "Échec de la mise à jour.");
    setPendingId(null);
  };

  const handleDelete = async (item: Product) => {
    const confirmed = window.confirm(
      `Supprimer définitivement "${item.title}" ? Cette action est irréversible.`,
    );
    if (!confirmed) return;
    setPendingId(item.id);
    setActionError(null);
    const result = await deleteListing(item.id);
    if (!result.success) setActionError(result.error ?? "Échec de la suppression.");
    setPendingId(null);
  };

  return (
    <div className="max-w-5xl">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display font-black text-4xl mb-2">
              Mes annonces
            </h1>
            <p className="text-black/60 dark:text-white/60">
              Gérez votre inventaire et suivez vos ventes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[var(--surface-elevated)] p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
              {["Tout", "En ligne", "Vendu", "Hors ligne"].map((f) => (
                <button
                  key={f}
                  className={`py-2 px-4 text-sm font-bold rounded-full transition-colors whitespace-nowrap ${filter === f ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"}`}
                  onClick={() => setFilter(f as typeof filter)}
                >
                  {f}
                </button>
              ))}
            </div>
            <Link
              href="/dashboard/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Nouvelle annonce
            </Link>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium">
            {actionError}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center p-16">
            <Loader2 className="w-7 h-7 animate-spin opacity-50" />
          </div>
        )}

        {!isLoading && error && (
          <div className="p-6 rounded-3xl bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-[var(--surface-elevated)] rounded-4xl overflow-hidden">
            {displayListings.length === 0 ? (
              <div className="p-12 text-center text-black/40 dark:text-white/40 font-bold">
                Aucune annonce trouvée avec ce filtre.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-sm text-black/60 dark:text-white/60">
                      <th className="font-semibold p-4 pl-6">Produit</th>
                      <th className="font-semibold p-4">Prix</th>
                      <th className="font-semibold p-4">Statut</th>
                      <th className="font-semibold p-4 text-right pr-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayListings.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <Link
                            href={`/product/${item.id}`}
                            className="flex items-center gap-4"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[var(--background)] shrink-0">
                              <Image
                                src={item.images[0]}
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm max-w-[200px] sm:max-w-xs truncate">
                                {item.title}
                              </div>
                              <div className="text-xs text-black/60 dark:text-white/60">
                                Ajouté le{" "}
                                {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 font-bold text-sm whitespace-nowrap">
                          {item.price.toLocaleString("fr-FR")} {item.currency}
                        </td>
                        <td className="p-4">
                          <select
                            value={item.status}
                            disabled={pendingId === item.id}
                            onChange={(e) =>
                              handleStatusChange(
                                item.id,
                                e.target.value as Product["status"],
                              )
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-full outline-none appearance-none cursor-pointer disabled:opacity-50 ${
                              item.status === "En ligne"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : item.status === "Vendu"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                  : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            <option value="En ligne">En ligne</option>
                            <option value="Vendu">Vendu</option>
                            <option value="Hors ligne">Hors ligne</option>
                          </select>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/dashboard/new?edit=${item.id}`)
                              }
                              disabled={pendingId === item.id}
                              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-black/60 dark:text-white/60 disabled:opacity-40"
                              aria-label="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              disabled={pendingId === item.id}
                              className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-black/60 dark:text-white/60 disabled:opacity-40"
                              aria-label="Supprimer"
                            >
                              {pendingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Reveal>
    </div>
  );
}
