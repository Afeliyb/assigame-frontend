"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "fr" | "en";

const FR = {
  nav_browse: "Explorer",
  nav_sell: "+ Vendre",
  nav_login: "Connexion",
  nav_location: "Localisation",
  nav_all_togo: "Tout le Togo",

  home_title: "Le Grand Marché en ligne.",
  home_subtitle: "Trouvez, achetez et vendez en toute confiance.",
  home_cta_explore: "Explorer le marché",
  home_cta_sell: "Publier",
  home_trending: "Tendances",
  home_see_all: "Tout voir",
  home_members: "Membres de confiance",
  home_sellers: "Vendeurs actifs à Lomé et environs.",
  home_featured: "Nouveauté Top",

  browse_title: "Explorer.",
  browse_subtitle: "Toutes les offres à portée de main.",
  browse_search: "Chercher un article...",
  browse_all: "Tous les articles",
  browse_no_result: "Aucun produit trouvé.",
  browse_loading: "Chargement...",

  filter_title: "Filtres",
  filter_category: "Catégorie",
  filter_city: "Ville",
  filter_all_cities: "Toutes les villes",
  filter_price: "Prix (FCFA)",
  filter_price_min: "Min",
  filter_price_max: "Max",
  filter_condition: "État",
  filter_sort: "Trier par",
  filter_sort_recent: "Plus récent",
  filter_sort_price_asc: "Prix ↑",
  filter_sort_price_desc: "Prix ↓",
  filter_sort_views: "Plus vus",
  filter_reset: "Réinitialiser",
  filter_apply: "Appliquer",
  filter_results: "résultats",

  cond_new: "Neuf",
  cond_very_good: "Très bon état",
  cond_good: "Bon état",
  cond_fair: "Satisfaisant",

  product_contact: "Contacter le vendeur",
  product_message: "Envoyer un message",
  product_views: "vues",
  product_sold: "Vendu",
  product_featured: "À la une",

  footer_by: "Fait avec passion à Lomé · Developed by AFELI YB.",
  footer_rights: "Tous droits réservés.",
};

const EN: typeof FR = {
  nav_browse: "Browse",
  nav_sell: "+ Sell",
  nav_login: "Log in",
  nav_location: "Location",
  nav_all_togo: "All Togo",

  home_title: "Premium second-hand, made in Togo.",
  home_subtitle: "A curated selection of items between individuals. Secure, fast and designed to last.",
  home_cta_explore: "Explore",
  home_cta_sell: "List an item",
  home_trending: "Trending",
  home_see_all: "See all",
  home_members: "Trusted members",
  home_sellers: "Active sellers in Lomé and surroundings.",
  home_featured: "New Top",

  browse_title: "Browse.",
  browse_subtitle: "All offers at your fingertips.",
  browse_search: "Search for an item...",
  browse_all: "All items",
  browse_no_result: "No products found.",
  browse_loading: "Loading...",

  filter_title: "Filters",
  filter_category: "Category",
  filter_city: "City",
  filter_all_cities: "All cities",
  filter_price: "Price (FCFA)",
  filter_price_min: "Min",
  filter_price_max: "Max",
  filter_condition: "Condition",
  filter_sort: "Sort by",
  filter_sort_recent: "Most recent",
  filter_sort_price_asc: "Price ↑",
  filter_sort_price_desc: "Price ↓",
  filter_sort_views: "Most viewed",
  filter_reset: "Reset",
  filter_apply: "Apply",
  filter_results: "results",

  cond_new: "New",
  cond_very_good: "Very good",
  cond_good: "Good",
  cond_fair: "Fair",

  product_contact: "Contact seller",
  product_message: "Send a message",
  product_views: "views",
  product_sold: "Sold",
  product_featured: "Featured",

  footer_by: "Made with passion in Lomé · Developed by AFELI YB.",
  footer_rights: "All rights reserved.",
};

type Translations = typeof FR;

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: FR,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("assigame-lang") as Lang | null;
    if (saved === "en" || saved === "fr") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("assigame-lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: lang === "en" ? EN : FR }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
