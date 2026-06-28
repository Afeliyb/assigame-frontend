# Assigame — Marketplace C2C (Lomé, Togo)

Assigame est une marketplace C2C permettant aux particuliers de Lomé d'acheter et de vendre des
articles d'occasion ou neufs (électronique, vêtements, maison, sport, beauté, livres, jouets, auto...).

Ce dépôt contient le **frontend** (Next.js / React / Tailwind CSS v4) du projet. Il consomme l'API
REST du backend **Spring Boot / PostgreSQL** (dossier `assigame backend`).

## Stack technique

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4, design "bento grid" en mode sombre
- `motion` (Framer Motion) pour les animations
- `lucide-react` pour les icônes

## Prérequis

- Node.js 18+
- Le backend Spring Boot doit être lancé (voir son propre README) et accessible, par défaut sur
  `http://localhost:8081`.

## Installation

```bash
npm install
```

## Configuration

Copier `.env.example` vers `.env.local` et ajuster si besoin l'URL de l'API :

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

## Lancer en développement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Build de production

```bash
npm run build
npm run start
```

## Comptes de démonstration

Le backend insère automatiquement quelques vendeurs et annonces de démonstration au premier
démarrage (voir `DataSeeder` côté backend). Mot de passe commun à tous ces comptes :

```
Assigame2026!
```

Exemple : `kodjo.mensah@assigame.tg` / `Assigame2026!`

## Structure principale

- `app/` — pages (accueil, explorer, fiche produit, profil vendeur public, authentification,
  tableau de bord vendeur)
- `components/` — composants partagés (navbar, footer, cartes produit, fournisseurs de contexte,
  modale de contact vendeur, visionneuse d'images)
- `lib/api/` — client API typé vers le backend Spring Boot (produits, catégories, utilisateurs,
  upload d'images) et fonctions d'adaptation des données
- `lib/types.ts` — types métier partagés (Product, Category, Seller...)

---

Developed by AFELI YB.
