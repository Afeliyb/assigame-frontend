/**
 * Composants SVG de drapeaux — remplacement des emojis flags qui ne s'affichent
 * pas correctement sur Windows (les flag emojis Unicode ne sont pas supportés
 * nativement par les polices Windows sans Segoe UI Emoji spécifique).
 */

/** Drapeau du Togo (5 bandes horizontales vertes/jaunes + canton rouge avec étoile blanche) */
export function TogoFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drapeau du Togo"
      role="img"
    >
      {/* 5 bandes horizontales égales (vert, jaune, vert, jaune, vert) */}
      <rect width="900" height="120" y="0"   fill="#006A4E" />
      <rect width="900" height="120" y="120" fill="#FFCE00" />
      <rect width="900" height="120" y="240" fill="#006A4E" />
      <rect width="900" height="120" y="360" fill="#FFCE00" />
      <rect width="900" height="120" y="480" fill="#006A4E" />
      {/* Canton rouge (2 bandes de hauteur × 1/3 de la largeur) */}
      <rect width="300" height="240" x="0" y="0" fill="#D21034" />
      {/* Étoile blanche à 5 branches centrée dans le canton */}
      <polygon
        fill="#FFFFFF"
        points="
          150,60
          164,101
          207,101
          173,127
          185,169
          150,144
          115,169
          127,127
          93,101
          136,101
        "
      />
    </svg>
  );
}

/** Drapeau de la France (tricolore bleu-blanc-rouge) */
export function FranceFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Français" role="img">
      <rect width="300" height="600" x="0"   fill="#002395" />
      <rect width="300" height="600" x="300" fill="#FFFFFF" />
      <rect width="300" height="600" x="600" fill="#ED2939" />
    </svg>
  );
}

/** Drapeau du Royaume-Uni (Union Jack simplifié) */
export function UKFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="English" role="img">
      <rect width="60" height="40" fill="#012169" />
      {/* Diagonales blanches */}
      <line x1="0" y1="0" x2="60" y2="40" stroke="white" strokeWidth="8" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="white" strokeWidth="8" />
      {/* Diagonales rouges */}
      <line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" strokeWidth="4" />
      <line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="4" />
      {/* Croix blanche */}
      <rect x="25" y="0" width="10" height="40" fill="white" />
      <rect x="0" y="15" width="60" height="10" fill="white" />
      {/* Croix rouge */}
      <rect x="27" y="0" width="6" height="40" fill="#C8102E" />
      <rect x="0" y="17" width="60" height="6" fill="#C8102E" />
    </svg>
  );
}