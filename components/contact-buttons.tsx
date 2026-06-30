"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  ChevronDown,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { LoginPromptModal } from "@/components/login-prompt-modal";
import { fetchContactInfo } from "@/lib/api/utilisateurs";
import { ApiError } from "@/lib/api/config";
import { sanitizePhoneDigits } from "@/lib/utils";

type ContactState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "revealed"; telephone: string; whatsapp: string }
  | { status: "error"; message: string };

type Props = {
  sellerId: string;
  sellerName: string;
  productTitle?: string;
  productId?: string;
  productPrice?: number;
  productImage?: string;
  disabled?: boolean;
};

export function ContactButtons({
  sellerId,
  sellerName,
  productTitle,
  productId,
  productPrice,
  productImage,
  disabled = false,
}: Props) {
  const { user } = useAuth();

  const [loginModal, setLoginModal] = useState<"idle" | "message" | "contact">(
    "idle",
  );
  const [contactState, setContactState] = useState<ContactState>({
    status: "idle",
  });
  const [copied, setCopied] = useState(false);

  /* ─── Message Assigame ─── */
  const handleMessage = () => {
    if (!user) {
      setLoginModal("message");
      return;
    }
    if (!productId) {
      window.location.href = `/dashboard/messages/${sellerId}`;
      return;
    }
    const params = new URLSearchParams({ produit: productId });
    if (productTitle) params.set("titre", productTitle);
    if (productPrice !== undefined) params.set("prix", String(productPrice));
    if (productImage) params.set("image", productImage);
    window.location.href = `/dashboard/messages/${sellerId}?${params.toString()}`;
  };
    
  /* ─── Afficher le numéro ─── */
  const handleRevealContact = async () => {
    // 1. NOUVEAU : On exige la connexion. Si pas d'utilisateur, on ouvre la modal et on coupe la fonction.
    if (!user) {
      setLoginModal("contact");
      return;
    }

    // 2. On garde cette vérification pour éviter de relancer un appel inutile si c'est déjà affiché
    if (contactState.status === "revealed") return;

    setContactState({ status: "loading" });
    try {
      // 3. Appel de la fonction (l'utilisateur est obligatoirement connecté à ce stade)
      const info = await fetchContactInfo(sellerId);
      setContactState({
        status: "revealed",
        telephone: info.telephone,
        whatsapp: info.whatsapp,
      });
    } catch (e) {
      setContactState({
        status: "error",
        message:
          e instanceof ApiError
            ? e.message
            : "Impossible de récupérer les coordonnées.",
      });
    }
  };

  /* ─── Copier le numéro ─── */
  const handleCopy = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silencieux */
    }
  };

  const contactNumber =
    contactState.status === "revealed"
      ? contactState.whatsapp || contactState.telephone
      : null;
  const whatsappDigits = contactNumber
    ? sanitizePhoneDigits(contactNumber)
    : null;
  const whatsappMsg = encodeURIComponent(
    productTitle
      ? `Bonjour ${sellerName.split(" ")[0]}, je suis intéressé(e) par votre annonce "${productTitle}" sur Assigame.`
      : `Bonjour ${sellerName.split(" ")[0]}, je vous contacte depuis Assigame.`,
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* ── Bouton principal : Message Assigame ── */}
        <button
          onClick={handleMessage}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Envoyer un message
        </button>

        {/* ── Bouton secondaire : Afficher le numéro ── */}
        {contactState.status !== "revealed" && (
          <button
            onClick={handleRevealContact}
            disabled={disabled || contactState.status === "loading"}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border-subtle)] rounded-full font-medium text-sm hover:bg-[var(--surface-elevated)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-black/70 dark:text-white/70"
          >
            {contactState.status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Phone className="w-4 h-4 opacity-60" />
                Afficher le numéro
                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
              </>
            )}
          </button>
        )}

        {/* ── Numéro révélé ── */}
        {contactState.status === "revealed" && (
          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <p className="text-[11px] font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">
              Coordonnées du vendeur
            </p>

            {/* WhatsApp */}
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#25D366]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#25D366]">WhatsApp</p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    +{whatsappDigits}
                  </p>
                </div>
              </a>
            )}

            {/* Numéro de téléphone */}
            {contactState.telephone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contactState.telephone}`}
                  className="flex-1 flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[var(--background)] transition-colors"
                >
                  <Phone className="w-4 h-4 opacity-50 shrink-0" />
                  <span className="text-sm font-semibold">
                    {contactState.telephone}
                  </span>
                </a>
                <button
                  onClick={() => handleCopy(contactNumber!)}
                  className="p-2 rounded-xl hover:bg-[var(--background)] transition-colors text-black/40 dark:text-white/40"
                  aria-label="Copier le numéro"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Aucune coordonnée renseignée */}
            {!contactState.telephone && !contactState.whatsapp && (
              <p className="text-xs text-black/40 dark:text-white/40 text-center py-2">
                Ce vendeur n&apos;a pas encore renseigné de numéro de contact.
              </p>
            )}

            <p className="text-[10px] text-black/30 dark:text-white/30 text-center mt-1">
              Privilégiez les remises en main propre dans un lieu public.
            </p>
          </div>
        )}

        {/* ── Erreur fetch ── */}
        {contactState.status === "error" && (
          <p className="text-xs text-red-500 text-center px-2">
            {contactState.message}
          </p>
        )}
      </div>

      {/* ── Modal de connexion ── */}
      <LoginPromptModal
        isOpen={loginModal !== "idle"}
        onClose={() => setLoginModal("idle")}
        reason={loginModal !== "idle" ? loginModal : "contact"}
      />
    </>
  );
}
