"use client";

import { usePathname } from "next/navigation";
// On importe le Footer exactement comme tu le faisais dans le layout
import { Footer } from "@/components/footer"; 

export function ConditionalFooter() {
  const pathname = usePathname();

  // Si on n'est PAS sur la page d'accueil ("/"), on cache le footer
  if (pathname !== "/") {
    return null;
  }

  // Sinon, on l'affiche
  return <Footer />;
}