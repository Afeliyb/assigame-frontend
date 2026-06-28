"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, LogIn, UserPlus, Lock } from "lucide-react";
import Link from "next/link";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Message contextuel à afficher dans le modal */
  reason?: "message" | "contact";
};

const REASONS = {
  message: {
    title: "Connectez-vous pour envoyer un message",
    desc: "Créez un compte gratuit ou connectez-vous pour contacter directement ce vendeur via la messagerie Assigame.",
  },
  contact: {
    title: "Connectez-vous pour afficher le numéro",
    desc: "Les coordonnées des vendeurs sont réservées aux membres connectés pour protéger leur vie privée.",
  },
};

export function LoginPromptModal({ isOpen, onClose, reason = "contact" }: Props) {
  /* Fermer au clavier */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const { title, desc } = REASONS[reason];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full sm:max-w-sm bg-[var(--background)] border border-[var(--border-subtle)] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface-elevated)] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icône */}
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 opacity-60" />
            </div>

            <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed mb-6">
              {desc}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/auth"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                Se connecter
              </Link>
              <Link
                href="/auth"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--border-subtle)] rounded-full font-semibold text-sm hover:bg-[var(--surface-elevated)] transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Créer un compte gratuit
              </Link>
            </div>

            <p className="text-[11px] text-center text-black/30 dark:text-white/30 mt-4">
              Inscription gratuite · Aucune carte requise
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
