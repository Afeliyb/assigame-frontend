import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";

/**
 * Génère une URL d'avatar à partir des initiales d'un nom, utilisée quand l'utilisateur
 * n'a pas (encore) uploadé de photo de profil.
 */
export function getAvatarUrl(name: string | undefined | null): string {
  const safeName = name && name.trim().length > 0 ? name : "Assigame";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=111111&color=ffffff&bold=true`;
}

export function getProductImage(images: string[] | undefined): string {
  return images && images.length > 0 ? images[0] : FALLBACK_PRODUCT_IMAGE;
}

/** Ne garde que les chiffres d'un numéro de téléphone (pour construire un lien wa.me ou tel:). */
export function sanitizePhoneDigits(phone: string | undefined | null): string {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
}

