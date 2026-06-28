"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Phone, Copy, X, Check } from "lucide-react";
import type { Seller } from "@/lib/types";
import { sanitizePhoneDigits } from "@/lib/utils";

type ContactSellerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  productTitle?: string;
};

export function ContactSellerModal({
  isOpen,
  onClose,
  seller,
  productTitle,
}: ContactSellerModalProps) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const whatsappDigits = sanitizePhoneDigits(seller.whatsapp);
  const phoneDigits = sanitizePhoneDigits(seller.phone);
  const hasContact = Boolean(whatsappDigits || phoneDigits);

  const whatsappMessage = encodeURIComponent(
    productTitle
      ? `Bonjour ${seller.name.split(" ")[0]}, je suis intéressé(e) par votre annonce "${productTitle}" sur Assigame.`
      : `Bonjour ${seller.name.split(" ")[0]}, je vous contacte depuis Assigame.`,
  );

  const handleCopy = async () => {
    const numberToCopy = seller.whatsapp || seller.phone || "";
    try {
      await navigator.clipboard.writeText(numberToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Le presse-papier n'est pas disponible dans ce contexte : on ignore silencieusement.
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full sm:max-w-sm bg-[var(--background)] border border-[var(--border-subtle)] rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-elegant)] p-6 max-h-[85vh] overflow-y-auto"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg">
                  Contacter {seller.name.split(" ")[0]}
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
                  Choisissez votre moyen de contact préféré
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!hasContact ? (
              <div className="text-sm text-black/60 dark:text-white/60 bg-[var(--surface-elevated)] rounded-2xl p-4">
                Ce vendeur n&apos;a pas encore renseigné de moyen de contact.
                Revenez un peu plus tard, ou consultez ses autres annonces.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {whatsappDigits && (
                  <a
                    href={`https://wa.me/${whatsappDigits}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">WhatsApp</span>
                      <span className="text-xs font-normal opacity-80">
                        Réponse généralement rapide
                      </span>
                    </div>
                  </a>
                )}

                {phoneDigits && (
                  <a
                    href={`tel:+${phoneDigits}`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-elevated)] font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">Appeler</span>
                      <span className="text-xs font-normal text-black/60 dark:text-white/60">
                        +{phoneDigits}
                      </span>
                    </div>
                  </a>
                )}

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-subtle)] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 shrink-0" />
                  ) : (
                    <Copy className="w-5 h-5 shrink-0" />
                  )}
                  <span className="text-sm">
                    {copied ? "Numéro copié !" : "Copier le numéro"}
                  </span>
                </button>
              </div>
            )}

            <p className="text-xs text-black/40 dark:text-white/40 mt-5 text-center">
              Privilégiez toujours les paiements et remises de main à main dans
              un lieu public à Lomé.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
