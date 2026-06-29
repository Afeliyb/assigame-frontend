"use client";

// app/admin/page.tsx
// Vue d'ensemble : KPIs, répartition des statuts, dernières annonces.

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Users, Eye, Star, ShoppingBag, TrendingUp, ArrowRight } from "lucide-react";
import { adminFetchAllProduits, adminFetchAllUtilisateurs } from "@/lib/api/admin";
import type { Product, AuthUser } from "@/lib/types";

// ── Composant carte stat ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
      <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="font-black text-2xl leading-none mb-1">{value}</p>
      <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [users,    setUsers]    = useState<AuthUser[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([adminFetchAllProduits(), adminFetchAllUtilisateurs()])
      .then(([p, u]) => { setProducts(p); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculs
  const online   = products.filter(p => p.status === "En ligne").length;
  const sold     = products.filter(p => p.status === "Vendu").length;
  const offline  = products.filter(p => p.status === "Hors ligne").length;
  const featured = products.filter(p => p.featured).length;
  const totalViews = products.reduce((acc, p) => acc + (p.views ?? 0), 0);

  const recent = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const STATS = [
    { label: "Annonces",     value: products.length,                      icon: Package,    color: "text-blue-500",    bg: "bg-blue-500/10" },
    { label: "Utilisateurs", value: users.length,                         icon: Users,      color: "text-green-500",   bg: "bg-green-500/10" },
    { label: "En ligne",     value: online,                               icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Vendus",       value: sold,                                 icon: ShoppingBag,color: "text-orange-500",  bg: "bg-orange-500/10" },
    { label: "À la une",     value: featured,                             icon: Star,       color: "text-yellow-500",  bg: "bg-yellow-500/10" },
    { label: "Vues totales", value: totalViews.toLocaleString("fr-FR"),   icon: Eye,        color: "text-purple-500",  bg: "bg-purple-500/10" },
  ];

  const STATUS_BARS = [
    { label: "En ligne",    count: online,  color: "bg-emerald-500" },
    { label: "Vendus",      count: sold,    color: "bg-orange-500" },
    { label: "Hors ligne",  count: offline, color: "bg-red-400" },
  ];

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl">Vue d'ensemble</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          Bienvenue sur le panneau d'administration Assigame.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Répartition statuts */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Répartition des annonces</h2>
            <Link href="/admin/products" className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
              Gérer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {STATUS_BARS.map(bar => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-black/60 dark:text-white/60">{bar.label}</span>
                  <span className="font-bold">{bar.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/8 dark:bg-white/8 overflow-hidden">
                  <div
                    className={`h-full ${bar.color} rounded-full transition-all duration-700`}
                    style={{ width: products.length ? `${(bar.count / products.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dernières annonces */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Dernières annonces</h2>
            <Link href="/admin/products" className="text-xs text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
              Tout voir <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 shrink-0">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate">{p.title}</p>
                  <p className="text-[11px] text-black/50 dark:text-white/50">
                    {p.price.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  p.status === "En ligne"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : p.status === "Vendu"
                    ? "bg-orange-500/15 text-orange-600"
                    : "bg-red-500/15 text-red-500"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}