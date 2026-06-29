"use client";

// app/admin/layout.tsx
// Layout du panneau admin. Protège toutes les routes /admin :
// - redirige vers "/" si non connecté
// - redirige vers "/" si connecté mais pas admin (isAdmin !== true)

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";

const LINKS = [
  { href: "/admin",            label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/products",   label: "Produits",       icon: Package },
  { href: "/admin/categories", label: "Catégories",     icon: Tags },
  { href: "/admin/users",      label: "Utilisateurs",   icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  if (!user.isAdmin) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)] pt-14 flex">

      {/* ═══ SIDEBAR FIXE (desktop) ═══ */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 h-full">

        {/* En-tête admin */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
            </div>
            <span className="font-black text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar || getAvatarUrl(user.name)}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-xs truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-orange-500">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] font-bold shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-40" />}
              </Link>
            );
          })}
        </nav>

        {/* Pied de sidebar */}
        <div className="p-3 border-t border-[var(--border-subtle)] flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-black/50 dark:text-white/50 hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Mon dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 pb-24 md:pb-5 md:p-8 lg:p-10">
          {children}
        </div>
      </main>

      {/* ═══ BOTTOM NAV MOBILE ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] flex items-center justify-around px-1 py-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all flex-1 ${
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-black/40 dark:text-white/40"
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? "scale-110" : ""}`} />
              <span className="text-[9px] font-bold">{label.split(" ")[0]}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[var(--foreground)] rounded-full" />
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-red-500 flex-1"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[9px] font-bold">Quitter</span>
        </button>
      </nav>
    </div>
  );
}