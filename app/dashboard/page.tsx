"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import {
  Eye, CheckCircle2, Wallet, Package, Loader2, AlertTriangle, Plus, TrendingUp,
} from "lucide-react";
import { fetchProduitsByVendeur } from "@/lib/api/produits";
import { ApiError } from "@/lib/api/config";
import type { Product } from "@/lib/types";

const STATUS_STYLES: Record<Product["status"], string> = {
  "En ligne":   "text-green-600 dark:text-green-400 bg-green-500/10",
  "Vendu":      "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  "Hors ligne": "text-black/50 dark:text-white/40 bg-black/5 dark:bg-white/5",
};

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [listings, setListings]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchProduitsByVendeur(user.id)
      .then((data)  => { if (!cancelled) setListings(data); })
      .catch((e)    => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Impossible de charger vos annonces."); })
      .finally(()   => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const stats = useMemo(() => {
    const active       = listings.filter((p) => p.status === "En ligne");
    const sold         = listings.filter((p) => p.status === "Vendu");
    const catalogValue = active.reduce((s, p) => s + p.price, 0);
    const totalViews   = listings.reduce((s, p) => s + (p.views ?? 0), 0);
    return { active, sold, catalogValue, totalViews };
  }, [listings]);

  const recentListings = useMemo(() =>
    [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [listings]
  );

  if (!user) return null;

  const STATS = [
    { label: "Annonces actives",    value: stats.active.length,                                      icon: Package,    color: "text-blue-500" },
    { label: "Valeur du catalogue", value: `${stats.catalogValue.toLocaleString("fr-FR")} FCFA`,    icon: Wallet,     color: "text-green-500" },
    { label: "Vues cumulées",       value: stats.totalViews.toLocaleString("fr-FR"),                icon: Eye,        color: "text-purple-500" },
    { label: "Articles vendus",     value: stats.sold.length,                                        icon: CheckCircle2, color: "text-orange-500" },
  ];

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl lg:text-3xl">
            Bonjour {user.firstName} 
          </h1>
          <p className="text-sm text-black/50 dark:text-white/50 mt-0.5">
            Voici un résumé de votre activité.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Nouvelle annonce
        </Link>
      </div>

      {/* ── Stats compactes ── */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin opacity-40" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-[var(--surface-elevated)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border-subtle)]"
                >
                  <div className={`shrink-0 w-9 h-9 rounded-xl bg-[var(--background)] flex items-center justify-center border border-[var(--border-subtle)]`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-lg leading-tight truncate">{s.value}</p>
                    <p className="text-[11px] text-black/50 dark:text-white/50 truncate">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Activité récente ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 opacity-50" />
                Activité récente
              </h2>
              <Link href="/dashboard/listings" className="text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                Voir tout →
              </Link>
            </div>

            <div className="bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
              {recentListings.length === 0 ? (
                <div className="py-10 text-center text-sm text-black/40 dark:text-white/40">
                  Aucune annonce.{" "}
                  <Link href="/dashboard/new" className="font-semibold underline underline-offset-2">
                    Publiez votre premier article
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {recentListings.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      {/* Miniature */}
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--background)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.title}</p>
                        <p className="text-[11px] text-black/50 dark:text-white/50">
                          {p.price.toLocaleString("fr-FR")} FCFA · {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
