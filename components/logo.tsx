import React from "react";

type LogoProps = {
  className?: string;
};

/**
 * Monogramme "A" évoquant la structure d'un toit de marché / d'une tente :
 * le "A" classique (les deux jambages + la barre) est surmonté de deux haubans
 * qui s'évasent depuis le sommet, comme l'armature d'un auvent de marché qui
 * "abrite" la transaction en dessous. Tracé en `currentColor` pour suivre la
 * couleur de texte ambiante (s'adapte donc tout seul au mode clair/sombre).
 */
export function Logo({ className = "w-7 h-7" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Haubans / armature de l'auvent (plus fins, en retrait) */}
      <path
        d="M24 5 L4 31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M24 5 L44 31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M4 31 L11 31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M37 31 L44 31"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Le "A" structurel (premier plan, plein) */}
      <path
        d="M24 5 L9 43"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 5 L39 43"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4 29 L32.6 29"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Logo complet avec le mot "ASSIGAME" accolé, pour la navbar / footer / page d'auth.
 * `textClassName` permet d'ajuster la taille du texte selon le contexte.
 */
export function LogoMark({
  iconClassName = "w-7 h-7",
  textClassName = "text-xl",
  className = "",
}: {
  iconClassName?: string;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Logo className={iconClassName} />
      <span
        className={`font-display font-black tracking-tight ${textClassName}`}
      >
        ASSIGAME
      </span>
    </span>
  );
}
