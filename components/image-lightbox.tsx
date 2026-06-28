"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

type ImageLightboxProps = {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt: string;
};

/**
 * Visionneuse plein écran : l'image est toujours contenue dans la hauteur visible
 * (max-h-[88vh], object-contain) afin que l'utilisateur n'ait jamais besoin de défiler
 * pour voir l'image en entier, quelle que soit sa taille d'origine.
 */
export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setIndex(initialIndex);
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, images.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
              {index + 1} / {images.length}
            </div>
          )}

          <motion.div
            key={index}
            className="relative w-full h-full flex items-center justify-center p-4 sm:p-10"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-5xl h-[80vh] max-h-[88vh]">
              <Image
                src={images[index]}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain"
                referrerPolicy="no-referrer"
                priority
              />
            </div>
          </motion.div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % images.length);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex(i);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === index ? "w-5 bg-white" : "bg-white/40"
                    }`}
                    aria-label={`Aller à l'image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
