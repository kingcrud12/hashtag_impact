# Hashtag Impact

Hashtag Impact est une plateforme web d'intelligence territoriale et de prospection immobilière ciblée. L'application facilite l'identification d'opportunités immobilières, avec un focus particulier sur la réhabilitation de la vacance de logements en France.

## Fonctionnalités Principales

### 1. Explorateur de Gisements (Page Recherche)
Un véritable tableau de bord interactif dédié à la prospection territoriale.
- **Données Officielles (LOVAC)** : L'application intègre et traite le fichier OpenData gouvernemental des logements vacants pour afficher des taux réels et vérifiables par commune.
- **Filtres Avancés & Dynamiques** : Un panneau latéral de recherche exhaustif où les filtres s'adaptent intelligemment (ex. : disparition du critère "Étage" pour la recherche d'un "Terrain").
- **Cartographie Interactive** : Visualisation des zones de recherche et des données statistiques sur une carte Leaflet.

### 2. Collecte de Dossiers (Page Dépôt)
Un formulaire fluide et ergonomique pour l'acquisition de leads (propriétaires ou apporteurs d'affaires).
- **Saisie Simplifiée** : Renseignement de l'adresse par autocomplétion branchée sur l'API de la Base Adresse Nationale (BAN).
- **Parcours Utilisateur Structuré** : Formulaire séquencé en 4 grands blocs (Le bien, Le contact, État juridique, Documents) pour optimiser le taux de conversion.
- **Design Premium** : Une interface minimaliste, moderne et rassurante.

## Stack Technique

- **Cœur** : React 19 + TypeScript
- **Outils de Build** : Vite
- **Cartographie** : `leaflet` & `react-leaflet`
- **Manipulation de la Donnée** : `papaparse` (pour la lecture rapide et asynchrone du dataset CSV LOVAC côté client)
- **Icônes** : `lucide-react`
- **Stylisation** : CSS "Vanilla" avec un système robuste de variables CSS pour une charte visuelle homogène et élégante.
- **APIs tierces** : API Adresse (geo.api.gouv.fr)

## Installation et Lancement Local

Assurez-vous de disposer de **Node.js 20.19+ ou 22.12+**.

1. Installer les dépendances du projet :
   ```bash
   npm install
   ```

2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

3. Ouvrir votre navigateur sur `http://localhost:5173`.

## Scripts Supplémentaires

- `npm run build` : Transpile le code TypeScript et crée le build de production avec Vite.
- `npm run preview` : Permet de prévisualiser le build de production en local.
- `npm run lint` : Exécute ESLint pour vérifier la qualité du code.
