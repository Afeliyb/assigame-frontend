"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight, Loader2, AlertTriangle, MapPin, TrendingUp, Shield, Zap, Users, PenTool, MessageCircle, Handshake  } from "lucide-react";

import { Reveal } from "@/components/animated-text";
import { InfiniteMarquee } from "@/components/infinite-marquee";
import { ProductCard } from "@/components/product-card";
import { Logo } from "@/components/logo";
import { useCursor } from "@/components/cursor-provider";
import { useListings } from "@/components/listings-provider";
import { useCategories } from "@/components/categories-provider";
import { useLanguage } from "@/components/language-provider";
import { getAvatarUrl } from "@/lib/utils";
import { TOGO_REGIONS, extractCityFromLocation } from "@/lib/togo";
import {
  Laptop, Shirt, Armchair, Dumbbell, Sparkles, BookOpen, Gamepad2, Car, Package,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Shirt, Armchair, Dumbbell, Sparkles, BookOpen, Gamepad2, Car, Package,
};

const TogoFlag = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={`${className} shrink-0 rounded-[2px] shadow-sm`}
  >
    <path
      fill="#006a4e"
      d="M0 0h512v102.4H0zm0 204.8h512v102.4H0zm0 204.8h512V512H0z"
    />
    <path fill="#ffce00" d="M0 102.4h512v102.4H0zm0 204.8h512v102.4H0z" />
    <path fill="#d21034" d="M0 0h307.2v307.2H0z" />
    <path
      fill="#fff"
      d="M153.6 51.2l32.6 100.2 105.3-76.5-105.3-76.5zm0 204.8l-32.6-100.2-105.3 76.5 105.3 76.5zM48.3 127.7h210.6l-85.3 62 32.6 100.2-125.3-91.1z"
    />
  </svg>
);

export default function HomePage() {
  const [introFinished, setIntroFinished] = useState(false);
  const { setCursorLabel } = useCursor();
  const { listings, isLoading, error } = useListings();
  const { categories } = useCategories();
  const { t } = useLanguage();

  useEffect(() => {
    const saved = sessionStorage.getItem("intro-done");
    if (saved) { setIntroFinished(true); return; }
    const timer = setTimeout(() => {
      setIntroFinished(true);
      sessionStorage.setItem("intro-done", "1");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const onlineListings = useMemo(() => listings.filter((p) => p.status === "En ligne"), [listings]);

  const featuredPool = useMemo(() => {
    const flagged = onlineListings.filter((p) => p.featured);
    return flagged.length >= 2 ? flagged : onlineListings;
  }, [onlineListings]);

  const featured  = featuredPool[0];
  const secondary = featuredPool[1];

  const heroShowcase = useMemo(() => {
    const used = new Set([featured?.id, secondary?.id]);
    return onlineListings.find((p) => !used.has(p.id));
  }, [onlineListings, featured, secondary]);

  const trending = useMemo(() => {
    const used = new Set([featured?.id, secondary?.id, heroShowcase?.id]);
    return onlineListings.filter((p) => !used.has(p.id)).slice(0, 10);
  }, [onlineListings, featured, secondary, heroShowcase]);

  const trustedSellers = useMemo(() => {
    const map = new Map<string, NonNullable<(typeof onlineListings)[number]["seller"]>>();
    onlineListings.forEach((p) => { if (p.seller && !map.has(p.seller.id)) map.set(p.seller.id, p.seller); });
    return Array.from(map.values());
  }, [onlineListings]);

  // Stats par ville
  const cityStats = useMemo(() => {
    const counts: Record<string, number> = {};
    onlineListings.forEach((p) => {
      if (!p.seller?.location) return;
      const city = extractCityFromLocation(p.seller.location);
      if (city) counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [onlineListings]);

  const stats = useMemo(() => ({
    total: onlineListings.length,
    sellers: trustedSellers.length,
    categories: categories.length,
  }), [onlineListings, trustedSellers, categories]);

  return (
    <div className="relative min-h-screen bg-[var(--background)] flex flex-col pt-[88px]">
      {/* INTRO */}
      <AnimatePresence mode="wait">
        {!introFinished && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            className="fixed inset-0 z-[100] bg-[var(--background)] flex items-center justify-center cursor-pointer"
            onClick={() => setIntroFinished(true)}
          >
            <div className="text-center font-display font-black text-5xl md:text-7xl tracking-tight leading-none overflow-hidden">
              {["ACHETER.", "VENDRE.", "NÉGOCIER."].map((word, i) => (
                <motion.div
                  key={word}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: i * 0.35, duration: 0.7, type: "spring" }}
                >
                  {word}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="text-base font-sans font-medium text-black/40 dark:text-white/40 mt-4 tracking-normal"
              >
                <TogoFlag className="w-4 h-4" /> La marketplace togolaise
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-10">

        {/* ═══════════════ HERO ═══════════════ */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-7 pb-12 lg:pt-6 lg:pb-16 mb-4">
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--surface-elevated)] rounded-full">
              <Logo className="w-4 h-8" />
              <span className="text-xs font-bold"><TogoFlag /> Marketplace N°1</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1]">
              {t.home_title}
            </h1>
            <p className="text-base lg:text-lg text-black/60 dark:text-white/60 leading-relaxed max-w-md">
              {t.home_subtitle}
            </p>

            {/* Stats rapides */}
            {stats.total > 0 && (
              <div className="flex items-center gap-5 text-sm">
                <div className="flex flex-col">
                  <span className="font-black text-2xl leading-tight">{stats.total}+</span>
                  <span className="text-black/50 dark:text-white/50 text-xs">Annonces</span>
                </div>
                <div className="w-px h-8 bg-[var(--border-subtle)]" />
                <div className="flex flex-col">
                  <span className="font-black text-2xl leading-tight">{stats.sellers}+</span>
                  <span className="text-black/50 dark:text-white/50 text-xs">Vendeurs</span>
                </div>
                <div className="w-px h-8 bg-[var(--border-subtle)]" />
                <div className="flex flex-col">
                  <span className="font-black text-2xl leading-tight">{stats.categories}+</span>
                  <span className="text-black/50 dark:text-white/50 text-xs">Catégories</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:scale-105 transition-transform">
                {t.home_cta_explore} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard/new" className="inline-flex items-center gap-2 px-6 py-3.5 border border-[var(--border-subtle)] rounded-full font-bold text-sm hover:bg-[var(--surface-elevated)] transition-colors">
                {t.home_cta_sell}
              </Link>
            </div>

            {/* Badges confiance */}
            <div className="flex flex-wrap gap-3 text-xs text-black/50 dark:text-white/50">
              {[
                { icon: Shield, label: "Sécurité" },
                { icon: Zap, label: "Chat Direct" },
                { icon: Users, label: "Profils Vérifiés" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-green-500" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Image hero — produit en vedette */}
          {isLoading ? (
            <div className="hidden lg:block h-72 rounded-[2rem] bg-[var(--surface-elevated)] animate-pulse" />
          ) : heroShowcase ? (
            <Link href={`/product/${heroShowcase.id}`} className="hidden lg:block h-72"
              onMouseEnter={() => setCursorLabel("Voir")} onMouseLeave={() => setCursorLabel(null)}>
              <motion.div
                className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[var(--surface-elevated)] group"
                whileHover={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Image src={heroShowcase.images[0]} alt={heroShowcase.title} fill sizes="50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20">
                  {heroShowcase.condition}
                </span>
                <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-3">
                  <h3 className="font-bold text-lg line-clamp-2 flex-1">{heroShowcase.title}</h3>
                  <span className="shrink-0 font-black text-base bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                    {heroShowcase.price.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div className="hidden lg:flex h-72 items-center justify-center rounded-[2rem] border border-dashed border-[var(--border-subtle)]">
              <Logo className="w-12 h-12 opacity-[0.06]" />
            </div>
          )}
        </Reveal>

        {/* ═══════════════ BENTO FEATURED ═══════════════ */}
        {!isLoading && !error && featured && (
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-16 auto-rows-[160px]">
            {/* Featured principal */}
            <Link href={`/product/${featured.id}`}
              className="lg:col-span-3 lg:row-span-2"
              onMouseEnter={() => setCursorLabel("Voir")} onMouseLeave={() => setCursorLabel(null)}>
              <motion.div className="w-full h-full min-h-[280px] rounded-[1.75rem] overflow-hidden relative group"
                whileHover={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                <Image src={featured.images[0]} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <span className="absolute top-5 left-5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 uppercase tracking-wide">
                   {t.home_featured}
                </span>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-display font-bold text-xl lg:text-2xl line-clamp-2 mb-2">{featured.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                      {featured.price.toLocaleString("fr-FR")} FCFA
                    </span>
                    <span className="text-white/60 text-sm">{featured.condition}</span>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Secondary */}
            {secondary && (
              <Link href={`/product/${secondary.id}`} className="lg:col-span-3 lg:row-span-1"
                onMouseEnter={() => setCursorLabel("Voir")} onMouseLeave={() => setCursorLabel(null)}>
                <motion.div className="w-full h-full min-h-[150px] rounded-[1.75rem] overflow-hidden relative group"
                  whileHover={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                  <Image src={secondary.images[0]} alt={secondary.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{secondary.title}</h3>
                    <span className="font-black text-base">{secondary.price.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Membres de confiance + Tout voir — barre fusionnée compacte */}
            <div className="lg:col-span-3 flex items-center justify-between px-5 py-4 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--background)]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {trustedSellers.slice(0, 4).map((s) => (
                    <div key={s.id} className="w-8 h-8 rounded-full border-2 border-[var(--background)] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.avatar || getAvatarUrl(s.name)} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {trustedSellers.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--background)] bg-[var(--surface-elevated)] flex items-center justify-center text-[10px] font-bold">
                      +{trustedSellers.length - 4}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{t.home_members}</p>
                  <p className="text-[11px] text-black/40 dark:text-white/40 mt-0.5">{t.home_sellers}</p>
                </div>
              </div>
              <Link
                href="/browse"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface-elevated)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all text-sm font-bold shrink-0"
                onMouseEnter={() => setCursorLabel("Go")} onMouseLeave={() => setCursorLabel(null)}
              >
                {t.home_see_all} <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ═══════════════ CATÉGORIES ═══════════════ */}
        {categories.length > 0 && (
          <Reveal className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-black text-2xl">Toutes les catégories</h2>
              <Link href="/browse" className="text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon ? (ICON_MAP[cat.icon] ?? Package) : Package;
                const count = onlineListings.filter((p) => p.categoryId === cat.id).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.slug}`}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--background)] group-hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-center leading-tight">{cat.name}</span>
                    {count > 0 && <span className="text-[10px] opacity-50">{count}</span>}
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* ═══════════════ MARQUEE ═══════════════ */}
        {categories.length > 0 && (
          <Reveal className="mb-10 -mx-4 sm:-mx-6 lg:-mx-10">
            <InfiniteMarquee speed={30} className="py-3">
              {categories.concat(categories).map((cat, i) => (
                <div key={`${cat.id}-${i}`} className="mx-3 px-5 py-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                  <TogoFlag /> {cat.name} <span className="opacity-20 ml-1">•</span>
                </div>
              ))}
            </InfiniteMarquee>
          </Reveal>
        )}

        {/* ═══════════════ PAR VILLE ═══════════════ */}
        {cityStats.length > 0 && (
          <Reveal className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-black text-2xl">Annonces par ville</h2>
                <p className="text-sm text-black/50 dark:text-white/50 mt-1">
                  <TogoFlag /> Partout au Togo · Indicatif +228
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cityStats.map(([city, count]) => (
                <Link
                  key={city}
                  href={`/browse?city=${encodeURIComponent(city)}`}
                  className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[var(--surface-elevated)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all group"
                >
                  <MapPin className="w-4 h-4 opacity-40 group-hover:opacity-60" />
                  <div>
                    <p className="font-bold text-sm">{city}</p>
                    <p className="text-[11px] opacity-50">{count} annonce{count > 1 ? "s" : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {/* ═══════════════ TENDANCES ═══════════════ */}
        {trending.length > 0 && (
          <Reveal className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-black text-2xl">{t.home_trending}</h2>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-bold">
                  <TrendingUp className="w-3 h-3" /> En hausse
                </span>
              </div>
              <Link href="/browse" className="text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1">
                {t.home_see_all} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {trending.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </Reveal>
        )}

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin opacity-40" />
          </div>
        )}
        {!isLoading && error && (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-500/10 text-red-500 mb-8">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
        <Reveal className="mb-10">
          <div className="p-6 lg:p-8 rounded-[2rem] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <h2 className="font-display font-black text-xl mb-6 text-center">
              Comment ça marche ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  step: "01",
                  icon: PenTool,
                  title: "Publiez votre annonce",
                  desc: "Ajoutez photos, description et prix. En moins de 2 minutes, votre article est en ligne sur tout le Togo.",
                },
                {
                  step: "02",
                  icon: MessageCircle,
                  title: "Négociez directement",
                  desc: "Acheteurs et vendeurs se contactent via WhatsApp (+228) ou la messagerie interne Assigame.",
                },
                {
                  step: "03",
                  icon: Handshake,
                  title: "Concluez l'affaire",
                  desc: "Rencontrez-vous dans un lieu public à Lomé, Kara ou ailleurs. Payez à la remise en main.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-3 bg-[var(--background)] rounded-2xl border border-[var(--border-subtle)]">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-black text-black/20 dark:text-white/20 tracking-widest">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-base">{title}</h3>
                  <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}