/**
 * Données géographiques du Togo utilisées pour les filtres de localisation
 * et les indicateurs d'identité togolaise dans l'UI.
 */

export type TogoRegion = {
  name: string;
  cities: string[];
};

export const TOGO_REGIONS: TogoRegion[] = [
  {
    name: "Maritime",
    cities: ["Lomé", "Tsévié", "Aného", "Vogan", "Tabligbo", "Kévé", "Adidogomé", "Baguida"],
  },
  {
    name: "Plateaux",
    cities: ["Atakpamé", "Kpalimé", "Notsé", "Badou", "Amlamé", "Kpedze"],
  },
  {
    name: "Centrale",
    cities: ["Sokodé", "Sotouboua", "Tchamba", "Blitta"],
  },
  {
    name: "Kara",
    cities: ["Kara", "Niamtougou", "Bassar", "Kandé", "Pagouda"],
  },
  {
    name: "Savanes",
    cities: ["Dapaong", "Mango", "Cinkassé", "Naki-Est"],
  },
];

export const ALL_CITIES = TOGO_REGIONS.flatMap((r) => r.cities);

/** Drapeaux pour les indicatifs pays — 🇹🇬 pour le Togo */
export const TOGO_DIAL = { code: "+228", flag: "🇹🇬", country: "Togo" };

/** Langues supportées */
export const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

/** Renvoie la région d'une ville donnée */
export function getRegionForCity(city: string): string {
  for (const region of TOGO_REGIONS) {
    if (region.cities.some((c) => c.toLowerCase() === city.toLowerCase())) {
      return region.name;
    }
  }
  return "";
}

/** Extrait la ville principale d'une chaîne de localisation (ex: "Adidogomé, Lomé" → "Lomé") */
export function extractCityFromLocation(location: string): string {
  if (!location) return "";
  const parts = location.split(",").map((s) => s.trim());
  return parts[parts.length - 1] || parts[0] || "";
}
