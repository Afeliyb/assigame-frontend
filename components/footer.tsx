"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Banknote, Phone } from "lucide-react";
import { Logo } from "./logo";
import { TogoFlag } from "./flags";
import { useLanguage } from "./language-provider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--background)] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Branding */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="w-6 h-6" />
              <span className="font-display font-black text-xl tracking-tight">ASSIGAME</span>
            </Link>
            <p className="text-sm text-black/60 dark:text-white/60 leading-relaxed mb-5 max-w-xs">
              Le marketplace C2C togolais. Achetez, vendez et négociez partout au Togo.
            </p>
            <div className="flex flex-col gap-2 text-xs text-black/40 dark:text-white/40">
              <span className="flex items-center gap-2">
                <TogoFlag className="w-5 h-3.5" />
                <span className="font-semibold">République Togolaise</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Indicatif : +228
              </span>
              <span className="flex items-center gap-2">
                <Banknote className="w-3 h-3" />
                Monnaie : FCFA (XOF)
              </span>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-bold text-sm mb-4">Catégories</h4>
            <ul className="space-y-2.5 text-sm text-black/60 dark:text-white/60">
              {["Vêtements", "Électronique", "Maison", "Sport", "Beauté"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/browse?category=${cat.toLowerCase()}`}
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Villes */}
          <div>
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <TogoFlag className="w-5 h-3.5" />
              Villes du Togo
            </h4>
            <ul className="space-y-2.5 text-sm text-black/60 dark:text-white/60">
              {["Lomé", "Kara", "Atakpamé", "Sokodé", "Kpalimé", "Dapaong"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/browse?city=${encodeURIComponent(city)}`}
                    className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3 h-3 opacity-40 shrink-0" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-bold text-sm mb-4">Liens utiles</h4>
            <ul className="space-y-2.5 text-sm text-black/60 dark:text-white/60">
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                  Conditions d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                  Aide & Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Explorer les annonces
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/new"
                  className="hover:text-black dark:hover:text-white transition-colors font-semibold"
                >
                  Vendre un article
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
         <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm">
          <p className="text-black/50 dark:text-white/50 text-center md:text-left order-2 md:order-1 text-xs">
            © {new Date().getFullYear()} ASSIGAME. Tous droits réservés.
          </p>

          <div className="flex justify-center items-center gap-1.5 order-1 md:order-2 text-black/60 dark:text-white/60">
            <span>Developed by</span>
            {/* Remplacement du <span> par un <a> avec les bonnes sécurités */}
            <a
              href="https://afeliyb.github.io/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black dark:text-white relative group cursor-pointer"
            >
              AFELI YB
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          <div className="hidden md:block order-3"></div>
        </div>
      </div>
    </footer>
  );
}