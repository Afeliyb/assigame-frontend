"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/auth-provider";
import { useListings } from "@/components/listings-provider";
import { useCategories } from "@/components/categories-provider";
import {
  UploadCloud, X, AlertCircle, Loader2, ArrowLeft, ChevronRight,
} from "lucide-react";
import type { Condition } from "@/lib/types";
import { fetchProduitById, updateProduit } from "@/lib/api/produits";
import { uploadImages } from "@/lib/api/upload";
import { ApiError } from "@/lib/api/config";

const CONDITIONS: Condition[] = ["Neuf", "Très bon état", "Bon état", "Satisfaisant"];
const MAX_IMAGES = 5;

type ImageItem = { key: string; previewUrl: string; file?: File };

function NewListingForm() {
  const { user } = useAuth();
  const { addListing, refresh } = useListings();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice]           = useState("");
  const [category, setCategory]     = useState("");
  const [condition, setCondition]   = useState<Condition>("Très bon état");
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Étape active du formulaire (wizard en 2 étapes)
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isEditMode && !category && categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [categories, category, isEditMode]);

  useEffect(() => {
    if (!editId || !user) return;
    let cancelled = false;
    setIsLoadingProduct(true);
    fetchProduitById(editId)
      .then((product) => {
        if (cancelled) return;
        if (product.sellerId !== user.id) { setLoadError("Vous ne pouvez modifier que vos propres annonces."); return; }
        setTitle(product.title);
        setDescription(product.description);
        setPrice(String(product.price));
        setCategory(product.categoryId);
        setCondition(product.condition);
        setImageItems(product.images.map((url, i) => ({ key: `existing-${i}-${url}`, previewUrl: url })));
        setStep(2);
      })
      .catch((e) => { if (!cancelled) setLoadError(e instanceof ApiError ? e.message : "Impossible de charger cette annonce."); })
      .finally(() => { if (!cancelled) setIsLoadingProduct(false); });
    return () => { cancelled = true; };
  }, [editId, user]);

  if (!user) return null;

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImageItems((prev) => {
      const room  = MAX_IMAGES - prev.length;
      const toAdd = incoming.slice(0, Math.max(room, 0)).map((file, i) => ({
        key: `new-${Date.now()}-${i}`, previewUrl: URL.createObjectURL(file), file,
      }));
      return [...prev, ...toAdd];
    });
  };

  const removeImage = (key: string) => {
    setImageItems((prev) => {
      const target = prev.find((it) => it.key === key);
      if (target?.file) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.key !== key);
    });
  };

  const resolveImageUrls = async (items: ImageItem[]): Promise<string[]> => {
    const filesToUpload = items.filter((it) => it.file).map((it) => it.file!);
    const uploaded = filesToUpload.length > 0 ? await uploadImages(filesToUpload) : [];
    let cursor = 0;
    return items.map((it) => (it.file ? uploaded[cursor++] : it.previewUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (imageItems.length === 0) { setFormError("Ajoutez au moins une photo de l'article."); return; }
    if (!category) { setFormError("Sélectionnez une catégorie."); return; }
    setIsSubmitting(true);
    try {
      const images = await resolveImageUrls(imageItems);
      if (isEditMode && editId) {
        await updateProduit(editId, { title, description, price: parseInt(price, 10), images, condition, categoryId: category });
        await refresh();
      } else {
        const result = await addListing({ title, description, price: parseInt(price, 10), images, condition, categoryId: category, sellerId: user.id });
        if (!result.success) throw new ApiError(result.error ?? "Échec de la publication.", 0);
      }
      router.push("/dashboard/listings");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Une erreur est survenue. Réessayez.");
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct || categoriesLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin opacity-40" /></div>;
  }
  if (loadError) {
    return <div className="p-5 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm font-medium">{loadError}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">

      {/* ── Progress indicator ── */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { n: 1, label: "Photos" },
          { n: 2, label: "Détails" },
        ].map(({ n, label }, i, arr) => (
          <React.Fragment key={n}>
            <button
              type="button"
              onClick={() => n < step || isEditMode ? setStep(n as 1|2) : undefined}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${
                step === n
                  ? "text-[var(--foreground)]"
                  : step > n
                  ? "text-black/40 dark:text-white/40 cursor-pointer hover:text-black/70"
                  : "text-black/25 dark:text-white/25 cursor-default"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                step === n
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : step > n
                  ? "bg-green-500 text-white"
                  : "bg-[var(--surface-elevated)]"
              }`}>
                {step > n ? "✓" : n}
              </span>
              {label}
            </button>
            {i < arr.length - 1 && <ChevronRight className="w-4 h-4 opacity-20 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Étape 1 : Photos ── */}
      {step === 1 && (
        <div className="space-y-4">
          {imageItems.length < MAX_IMAGES && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
              className="relative border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors group"
            >
              <input
                type="file" multiple accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
              />
              <UploadCloud className="w-9 h-9 mb-3 text-black/30 dark:text-white/30 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-sm mb-0.5">Glissez vos photos ici</p>
              <p className="text-xs text-black/50 dark:text-white/50">
                ou cliquez pour parcourir · Max {MAX_IMAGES} photos
              </p>
            </div>
          )}

          {imageItems.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imageItems.map((item, idx) => (
                <div key={item.key} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-black/60 text-white py-0.5 z-10">
                      Principale
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(item.key)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={imageItems.length === 0}
            onClick={() => setStep(2)}
            className="w-full py-3 mt-2 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Continuer
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Étape 2 : Détails ── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-black/60 dark:text-white/60 uppercase tracking-wider">
              Titre de l&apos;article
            </label>
            <input
              type="text" required value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: iPhone 13 Pro Max · 256 Go"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none text-sm font-medium"
            />
          </div>

          {/* Catégorie + État */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-black/60 dark:text-white/60 uppercase tracking-wider">Catégorie</label>
              <select
                required value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none text-sm font-medium appearance-none"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-black/60 dark:text-white/60 uppercase tracking-wider">État</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none text-sm font-medium appearance-none"
              >
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-black/60 dark:text-white/60 uppercase tracking-wider">Description</label>
            <textarea
              required rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre article avec précision…"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none text-sm font-medium resize-none"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-black/60 dark:text-white/60 uppercase tracking-wider">Prix (FCFA)</label>
            <div className="relative">
              <input
                type="number" required min="0" step="1000" value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none text-sm font-bold pr-16"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40 dark:text-white/40">
                FCFA
              </span>
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold text-black/50 dark:text-white/50 hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? "Enregistrer" : "Publier l'annonce"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

export default function NewListingPage() {
  const router = useRouter();

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
        onClick={() => router.push("/dashboard")}
      />

      {/* Modal panel */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed z-[90] left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[480px] top-[72px] bottom-4 sm:bottom-auto bg-[var(--background)] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] shrink-0">
          <div>
            <h2 className="font-display font-black text-base">
              Nouvelle annonce
            </h2>
            <p className="text-[11px] text-black/50 dark:text-white/50">
              Votre article sera visible sur tout le Togo
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-full hover:bg-[var(--surface-elevated)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin opacity-40" /></div>}>
            <NewListingForm />
          </Suspense>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}