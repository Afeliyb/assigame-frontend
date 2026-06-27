"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useFavorites } from "@/components/favorites-provider";
import {
  LayoutDashboard, Tags, Plus, User, LogOut, Heart,
  MessageSquare, ChevronRight,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/utils";
import { fetchNonLus } from "@/lib/api/messages";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname       = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { favoriteIds } = useFavorites();
  const router         = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNonLus(user.id).then(setUnreadMessages).catch(() => {});
    const interval = setInterval(() => {
      fetchNonLus(user.id).then(setUnreadMessages).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth");
  }, [user, isLoading, router]);

  if (isLoading || !user)
    return <div className="min-h-screen bg-[var(--background)]" />;

  const LINKS = [
    { href: "/dashboard",            label: "Aperçu",            icon: LayoutDashboard },
    { href: "/dashboard/listings",   label: "Mes annonces",      icon: Tags },
    { href: "/dashboard/favorites",  label: "Mes favoris",       icon: Heart,         badge: favoriteIds.size > 0 ? favoriteIds.size : undefined },
    { href: "/dashboard/messages",   label: "Messages",          icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { href: "/dashboard/profile",    label: "Mon profil",        icon: User },
  ];

  // Bouton "Vendre" : ouvre le modal via navigation vers /dashboard/new
  const isNew = pathname === "/dashboard/new";

  return (
    // On supprime le Footer dans le dashboard via overflow-hidden sur le conteneur
    <div className="h-screen overflow-hidden bg-[var(--background)] pt-14 flex">

      {/* ═══ SIDEBAR FIXE ═══ */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40 h-full">

        {/* Profil compact */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || getAvatarUrl(user.name)}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{user.name}</p>
            <p className="text-[11px] text-black/50 dark:text-white/50 truncate">
              {user.location || "Vendeur Assigame"}
            </p>
          </div>
        </div>

        {/* CTA Vendre (en haut, bien visible) */}
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/dashboard/new"
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isNew
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-85"
            }`}
          >
            <Plus className="w-4 h-4" />
            Vendre un article
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {LINKS.map((link) => {
            const Icon    = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] font-bold shadow-sm"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
                {link.badge !== undefined && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                    isActive ? "bg-white/20" : "bg-red-500 text-white"
                  }`}>
                    {link.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 opacity-40" />}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion — ancré en bas */}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ═══ CONTENU PRINCIPAL (scrollable) ═══ */}
      <main className="flex-1 overflow-y-auto">
        {/* Nav mobile */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-1 px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/40">
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[var(--foreground)] text-[var(--background)] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Vendre
          </Link>
          {LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all relative ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] font-bold"
                    : "text-black/60 dark:text-white/60 hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
                {link.badge !== undefined && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-black bg-red-500 text-white rounded-full flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-5 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}