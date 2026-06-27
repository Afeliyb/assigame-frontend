"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Heart, MapPin, ExternalLink,
  Calendar, Eye, Loader2, AlertTriangle, MessageSquare,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useCursor } from "@/components/cursor-provider";
import { useListings } from "@/components/listings-provider";
import { useAuth } from "@/components/auth-provider";
import { useFavorites } from "@/components/favorites-provider";
import { fetchProduitById, incrementerVuesProduit } from "@/lib/api/produits";
import { ApiError } from "@/lib/api/config";
import type { Product } from "@/lib/types";
import { ImageLightbox } from "@/components/image-lightbox";
import { ContactSellerModal } from "@/components/contact-seller-modal";
import { getAvatarUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCategories } from "@/components/categories-provider";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const { setCursorLabel } = useCursor();
  const { listings } = useListings();
  const { categories } = useCategories();
  const { user } = useAuth();
  const { favoriteIds, toggle: toggleFavorite } = useFavorites();
  const router = useRouter();

  const [product, setProduct]           = useState<Product | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [contactOpen, setContactOpen]   = useState(false);
  const [activeImage, setActiveImage]   = useState(0);

  const isLiked = id ? favoriteIds.has(id) : false;

  const handleLike = async () => {
    if (!user) { router.push("/auth"); return; }
    if (id) await toggleFavorite(id);
  };

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    fetchProduitById(id)
      .then((data) => { if (!cancelled) { setProduct(data); incrementerVuesProduit(id); } })
      .catch((e)   => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Impossible de charger cette annonce."); })
      .finally(()  => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  /* ── États de chargement / erreur ── */
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin opacity-40" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="w-10 h-10 opacity-30" />
        <h1 className="text-2xl font-black">{error ?? "Produit introuvable"}</h1>
        <Link href="/browse" className="text-sm underline underline-offset-4 opacity-60">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const seller = product.seller;
  const category = categories.find((c) => c.id === product.categoryId);

  const relatedProducts = listings
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.status === "En ligne")
    .slice(0, 5);

  const joinedYear = seller?.joinedAt ? new Date(seller.joinedAt).getFullYear() : null;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-[72px] pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Breadcrumb compact ── */}
        <div className="flex items-center gap-2 py-4 text-xs text-black/40 dark:text-white/40">
          <Link href="/browse" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Catalogue
          </Link>
          {category && <>
            <span>/</span>
            <Link href={`/browse?category=${category.slug}`} className="hover:text-black dark:hover:text-white transition-colors">
              {category.name}
            </Link>
          </>}
          <span>/</span>
          <span className="truncate max-w-[200px] text-black/60 dark:text-white/60">{product.title}</span>
        </div>

        {/* ═══ LAYOUT PRINCIPAL ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8">

          {/* ── Colonne gauche : galerie ── */}
          <div className="flex flex-col gap-3">
            {/* Image principale — hauteur limitée */}
            <div
              className="relative w-full h-[300px] sm:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden bg-[var(--surface-elevated)] cursor-zoom-in"
              onMouseEnter={() => setCursorLabel("Zoom")}
              onMouseLeave={() => setCursorLabel(null)}
              onClick={() => { setLightboxIndex(activeImage); setLightboxOpen(true); }}
            >
              <Image
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
                referrerPolicy="no-referrer"
                priority
              />
              {product.status !== "En ligne" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full">
                    {product.status}
                  </span>
                </div>
              )}
            </div>

            {/* Vignettes horizontales */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-[var(--foreground)]"
                        : "border-transparent hover:border-[var(--border-subtle)]"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Photo ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Colonne droite : infos + vendeur (compact, sticky) ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-[72px] lg:h-fit">

            {/* Titre + prix */}
            <div>
              {product.status !== "En ligne" && (
                <span className="inline-block mb-2 px-2.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
                  {product.status}
                </span>
              )}
              <h1 className="font-display font-black text-xl sm:text-2xl leading-tight mb-2">
                {product.title}
              </h1>
              <div className="text-2xl sm:text-3xl font-black mb-3">
                {product.price.toLocaleString("fr-FR")}
                <span className="text-base font-bold text-black/40 dark:text-white/40 ml-1.5">FCFA</span>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-[var(--surface-elevated)] rounded-full text-xs font-semibold border border-[var(--border-subtle)]">
                  {product.condition}
                </span>
                {category && (
                  <Link href={`/browse?category=${category.slug}`}
                    className="px-2.5 py-1 bg-[var(--surface-elevated)] rounded-full text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--foreground)] transition-colors">
                    {category.name}
                  </Link>
                )}
                {typeof product.views === "number" && (
                  <span className="px-2.5 py-1 bg-[var(--surface-elevated)] rounded-full text-xs font-semibold border border-[var(--border-subtle)] flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {product.views}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* CTA */}
            <div className="flex gap-2">
              <button
                onClick={() => setContactOpen(true)}
                disabled={product.status !== "En ligne"}
                className="flex-1 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Contacter le vendeur
              </button>
              <button
                onClick={handleLike}
                aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`p-3 rounded-full border transition-all ${
                  isLiked
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Messagerie interne */}
            {user && seller && user.id !== String(seller.id) && product.status === "En ligne" && (
              <Link
                href={`/dashboard/messages/${seller.id}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-[var(--border-subtle)] text-sm font-semibold hover:bg-[var(--surface-elevated)] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Envoyer un message Assigame
              </Link>
            )}

            {/* ── Carte vendeur ── */}
            {seller && (
              <div className="p-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={seller.avatar || getAvatarUrl(seller.name)}
                    alt={seller.name}
                    className="w-11 h-11 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{seller.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-black/50 dark:text-white/50">
                      {seller.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {seller.location}
                        </span>
                      )}
                      {joinedYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Depuis {joinedYear}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/seller/${seller.id}`}
                    className="ml-auto shrink-0 p-2 rounded-xl hover:bg-[var(--background)] transition-colors text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                    aria-label="Voir le profil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                {seller.bio && (
                  <p className="text-xs text-black/50 dark:text-white/50 mt-2.5 leading-relaxed line-clamp-2">
                    {seller.bio}
                  </p>
                )}
              </div>
            )}

            {/* Référence */}
            <p className="text-[11px] text-black/25 dark:text-white/25 text-center">
              Réf. #{product.id}
            </p>
          </div>
        </div>

        {/* ═══ VOUS AIMEREZ AUSSI — juste sous le bloc principal ═══ */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-xl">Vous aimerez aussi</h2>
              <Link
                href={`/browse?category=${category?.slug ?? ""}`}
                className="text-xs font-semibold opacity-50 hover:opacity-100 transition-opacity"
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      <ImageLightbox
        images={product.images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={product.title}
      />
      {seller && (
        <ContactSellerModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          seller={seller}
          productTitle={product.title}
        />
      )}
    </div>
  );
}