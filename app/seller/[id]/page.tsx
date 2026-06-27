"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/animated-text";
import { ProductCard } from "@/components/product-card";
import { ContactSellerModal } from "@/components/contact-seller-modal";
import { fetchSellerById } from "@/lib/api/utilisateurs";
import { fetchProduitsByVendeur } from "@/lib/api/produits";
import { ApiError } from "@/lib/api/config";
import type { Product, Seller } from "@/lib/types";
import { getAvatarUrl } from "@/lib/utils";

export default function SellerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([fetchSellerById(id), fetchProduitsByVendeur(id)])
      .then(([sellerData, produits]) => {
        if (!cancelled) {
          setSeller(sellerData);
          setListings(produits);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : "Impossible de charger ce profil vendeur.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-24 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center pb-24 flex flex-col items-center gap-4">
        {error && <AlertTriangle className="w-10 h-10 opacity-40" />}
        <h1 className="text-3xl font-black mb-2">
          {error ? "Une erreur est survenue" : "Vendeur introuvable"}
        </h1>
        {error && (
          <p className="text-black/60 dark:text-white/60 max-w-md">{error}</p>
        )}
        <Link href="/browse" className="underline underline-offset-4 mt-2">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const activeListings = listings.filter((p) => p.status === "En ligne");
  const soldListings = listings.filter((p) => p.status === "Vendu");
  const joinedYear = seller.joinedAt
    ? new Date(seller.joinedAt).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 mb-8 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour</span>
        </Link>

        <Reveal className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12 p-6 sm:p-8 rounded-[2rem] bg-[var(--surface-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seller.avatar || getAvatarUrl(seller.name)}
            alt={seller.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[var(--background)] shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display font-black text-3xl mb-2">
              {seller.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-black/60 dark:text-white/60 mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {seller.location}
              </span>
              {joinedYear && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Membre depuis {joinedYear}
                </span>
              )}
              <span className="font-semibold">
                {activeListings.length} annonce
                {activeListings.length > 1 ? "s" : ""} active
                {activeListings.length > 1 ? "s" : ""}
              </span>
            </div>
            {seller.bio && (
              <p className="text-black/70 dark:text-white/70 max-w-xl mb-4">
                {seller.bio}
              </p>
            )}
            <button
              onClick={() => setContactOpen(true)}
              className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold hover:scale-[1.02] transition-transform active:scale-95"
            >
              Contacter
            </button>
          </div>
        </Reveal>

        <div className="mb-8">
          <h2 className="font-display font-black text-2xl mb-6">
            Annonces en ligne
          </h2>
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {activeListings.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-black/40 dark:text-white/40 font-medium py-8">
              Ce vendeur n&apos;a aucune annonce en ligne pour le moment.
            </p>
          )}
        </div>

        {soldListings.length > 0 && (
          <div>
            <h2 className="font-display font-black text-2xl mb-6">
              Articles déjà vendus
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 opacity-60">
              {soldListings.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ContactSellerModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        seller={seller}
      />
    </div>
  );
}
