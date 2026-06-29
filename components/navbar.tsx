"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, useScroll, AnimatePresence } from "motion/react";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Plus,
  MapPin,
  ChevronDown,
  Globe,
  Banknote,
  Clock,
  Check,
  Wifi,
  MessageSquare,
} from "lucide-react";
import { Logo } from "./logo";
import { TogoFlag, FranceFlag, UKFlag } from "./flags";
import { useTheme } from "./theme-provider";
import { useAuth } from "./auth-provider";
import { useCategories } from "./categories-provider";
import { useLanguage } from "./language-provider";
import { useLocation } from "./location-provider";
import { getAvatarUrl } from "@/lib/utils";
import { TOGO_REGIONS, TOGO_DIAL } from "@/lib/togo";
import { fetchNonLus } from "@/lib/api/messages";

export function Navbar() {
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { lang, setLang, t } = useLanguage();
  const { selectedCity, setSelectedCity } = useLocation();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // NOUVEAU : État pour les messages non lus
  const [unreadMessages, setUnreadMessages] = useState(0);

  // NOUVEAU : Récupération des messages en temps réel (toutes les 30s)
  useEffect(() => {
    if (!user) return;
    fetchNonLus(user.id)
      .then(setUnreadMessages)
      .catch(() => {});
    const interval = setInterval(() => {
      fetchNonLus(user.id)
        .then(setUnreadMessages)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const pathname = usePathname(); // Ajoute cette ligne

  const locationRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const unsub = scrollY.on("change", (v) => setScrolled(v > 30));
    return () => unsub();
  }, [scrollY]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      )
        setLocationOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goToSearch = (value: string) => {
    const trimmed = value.trim();
    router.push(
      trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse",
    );
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* ── Navbar principale ── */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group mr-2"
          >
            <Logo className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {/* Texte ASSIGAME visible partout */}
            <span className="font-display font-black text-xl tracking-tight inline">
              ASSIGAME
            </span>
          </Link>

          {/* Catégories desktop */}
          <div className="hidden xl:flex items-center gap-0.5">
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/browse?category=${c.slug}`}
                className="px-3 py-1.5 text-[13px] font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all whitespace-nowrap"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/browse"
              className="px-3 py-1.5 text-[13px] font-semibold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white rounded-xl transition-all"
            >
              Tout →
            </Link>
          </div>

          <div className="flex-1" />

          {/* Barre de recherche */}
          <form
            className="hidden md:flex relative group max-w-[260px] lg:max-w-[320px] w-full"
            onSubmit={(e) => {
              e.preventDefault();
              goToSearch(query);
            }}
          >
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.browse_search}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] focus:border-black/20 dark:focus:border-white/20 outline-none text-sm font-medium transition-all"
            />
          </form>

          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* ── Localisation ── */}
            <div ref={locationRef} className="relative hidden sm:block">
              <button
                onClick={() => {
                  setLocationOpen((v) => !v);
                  setLangOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all border ${
                  locationOpen || selectedCity
                    ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                    : "border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <TogoFlag className="w-4 h-3" />
                <span>{selectedCity ?? "Togo"}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${locationOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {locationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-elegant)] z-50 overflow-hidden"
                  >
                    {/* En-tête */}
                    <div className="p-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                      <TogoFlag className="w-6 h-4" />
                      <div>
                        <p className="text-xs font-bold">
                          Togo · {TOGO_DIAL.code}
                        </p>
                        <p className="text-[10px] text-black/40 dark:text-white/40">
                          Sélectionnez votre ville
                        </p>
                      </div>
                    </div>

                    <div className="p-2 max-h-72 overflow-y-auto">
                      {/* Tout le Togo */}
                      <button
                        onClick={() => {
                          setSelectedCity(null);
                          setLocationOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                          !selectedCity
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "hover:bg-[var(--surface-elevated)]"
                        }`}
                      >
                        <TogoFlag className="w-4 h-3" />
                        Tout le Togo
                        {!selectedCity && (
                          <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                      </button>

                      {/* Régions */}
                      {TOGO_REGIONS.map((region) => (
                        <div key={region.name} className="mt-1">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black/30 dark:text-white/30">
                            {region.name}
                          </div>
                          {region.cities.map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                setSelectedCity(city);
                                setLocationOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all ${
                                selectedCity === city
                                  ? "bg-[var(--foreground)] text-[var(--background)] font-semibold"
                                  : "hover:bg-[var(--surface-elevated)] text-black/70 dark:text-white/70"
                              }`}
                            >
                              <MapPin className="w-3 h-3 opacity-40" />
                              {city}
                              {selectedCity === city && (
                                <Check className="w-3 h-3 ml-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>

                    {selectedCity && (
                      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[11px] text-center text-black/50 dark:text-white/50">
                        Filtré sur{" "}
                        <span className="font-bold text-black dark:text-white">
                          {selectedCity}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Langue ── */}
            <div ref={langRef} className="relative hidden lg:block">
              <button
                onClick={() => {
                  setLangOpen((v) => !v);
                  setLocationOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] font-bold border border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-all"
              >
                <Globe className="w-3.5 h-3.5 opacity-60" />
                <span>{lang.toUpperCase()}</span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-[var(--background)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-elegant)] z-50 p-1.5"
                  >
                    {[
                      {
                        code: "fr" as const,
                        label: "Français",
                        Flag: FranceFlag,
                      },
                      { code: "en" as const, label: "English", Flag: UKFlag },
                    ].map(({ code, label, Flag }) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLang(code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                          lang === code
                            ? "bg-[var(--foreground)] text-[var(--background)] font-bold"
                            : "hover:bg-[var(--surface-elevated)]"
                        }`}
                      >
                        <Flag className="w-5 h-3.5 rounded-[2px]" />
                        {label}
                        {lang === code && (
                          <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Thème ── */}
            {isMounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
                aria-label="Basculer le thème"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* ── Avatar / Connexion ── */}
            {user ? (
              <Link
                href="/dashboard"
                className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-subtle)] shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || getAvatarUrl(user.name)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
              >
                {t.nav_login}
              </Link>
            )}

            {/* ── Actions Mobile / Desktop ── */}
            {user ? (
              <div className="flex items-center gap-1.5">
                {/* Icône Messages sur Mobile (remplace le bouton vendre) */}
                <Link
                  href="/dashboard/messages"
                  className="relative p-2 md:hidden rounded-xl hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-[var(--background)]">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Bouton Vendre (Restreint au Desktop) */}
                <Link
                  href="/dashboard/new"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Vendre</span>
                </Link>
              </div>
            ) : (
              /* Visiteur non connecté : on garde un bouton de connexion/vente générique */
              <Link
                href="/auth"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span>Vendre</span>
              </Link>
            )}

            {/* ── Burger mobile ── */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--surface-elevated)]"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Barre de recherche mobile (visible uniquement sur l'accueil) ── */}
        {pathname === "/" && (
          <div className="md:hidden px-4 pb-3">
            <form
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault();
                goToSearch(query);
              }}
            >
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] focus:border-black/20 dark:focus:border-white/20 outline-none text-sm font-medium transition-all shadow-sm"
              />
            </form>
          </div>
        )}
      </motion.nav>

      {/* ── Menu mobile ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[var(--background)] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <Logo className="w-5 h-5" />
                  <span className="font-display font-black">ASSIGAME</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--surface-elevated)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                {/* Profil */}
                {user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 bg-[var(--surface-elevated)] rounded-2xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar || getAvatarUrl(user.name)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-xs text-black/50 dark:text-white/50">
                        Tableau de bord
                      </p>
                    </div>
                  </Link>
                )}

                {/* Recherche */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    goToSearch(query);
                  }}
                >
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[var(--surface-elevated)] outline-none text-sm"
                    />
                  </div>
                </form>

                {/* Localisation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TogoFlag className="w-5 h-3.5" />
                    <p className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
                      Localisation · {TOGO_DIAL.code}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCity(null)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        !selectedCity
                          ? "bg-[var(--foreground)] text-[var(--background)]"
                          : "bg-[var(--surface-elevated)]"
                      }`}
                    >
                      Tout le Togo
                    </button>
                    {TOGO_REGIONS.flatMap((r) => r.cities.slice(0, 2)).map(
                      (city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 ${
                            selectedCity === city
                              ? "bg-[var(--foreground)] text-[var(--background)]"
                              : "bg-[var(--surface-elevated)]"
                          }`}
                        >
                          <MapPin className="w-3 h-3 opacity-50" />
                          {city}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Catégories */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                    Catégories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/browse?category=${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 bg-[var(--surface-elevated)] rounded-full text-sm font-medium"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Langue */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40 mb-2">
                    Langue
                  </p>
                  <div className="flex gap-2">
                    {[
                      {
                        code: "fr" as const,
                        label: "Français",
                        Flag: FranceFlag,
                      },
                      { code: "en" as const, label: "English", Flag: UKFlag },
                    ].map(({ code, label, Flag }) => (
                      <button
                        key={code}
                        onClick={() => setLang(code)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                          lang === code
                            ? "bg-[var(--foreground)] text-[var(--background)]"
                            : "bg-[var(--surface-elevated)]"
                        }`}
                      >
                        <Flag className="w-5 h-3.5 rounded-[2px]" />
                        {code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                {!user && (
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center font-semibold bg-[var(--surface-elevated)] rounded-full"
                  >
                    Connexion
                  </Link>
                )}
                <Link
                  href="/dashboard/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center font-bold bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Vendre un article
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
