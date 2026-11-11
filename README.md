# FitApp – appli musculation

Application mobile (Expo / React Native) pour le sport :

- **Nutrition** : recettes avec calories et macros, choix des portions
- **Courses** : liste générée automatiquement à partir des recettes + articles ajoutés à la main
- **Muscu** : exercices par groupe musculaire avec conseils d'exécution
- **Minuteur** : temps de repos, avec notification même téléphone verrouillé
- **Suivi** : poids, pas, sommeil, eau au jour le jour
- **Carnet** : séries (poids × reps) avec rappel de la dernière perf ; lance le repos automatiquement

Toutes les données restent sur le téléphone.

## Installer sur un téléphone Android

1. Sur le téléphone, ouvre la page **Releases** du dépôt GitHub (colonne de droite sur la page du dépôt, ou ajoute `/releases/latest` à l'adresse du dépôt).
2. Télécharge **FitApp.apk**.
3. Ouvre le fichier. Android demande d'autoriser l'installation d'applis provenant de cette source (Chrome / Fichiers) : accepte.
4. Lance FitApp et autorise les notifications (pour l'alerte de fin de repos).

Chaque modification poussée sur GitHub recompile automatiquement une nouvelle version
(onglet **Actions**, workflow *Build Android APK*). Pour mettre à jour, il suffit
d'installer le nouvel APK par-dessus : les données sont conservées.

## Sur iPhone (ou pour tester rapidement)

Apple n'autorise pas l'installation d'un fichier comme sur Android. Le plus simple :

1. Installe **Expo Go** depuis l'App Store / le Play Store.
2. Sur un ordinateur avec Node.js : `npm install` puis `npx expo start`.
3. Scanne le QR code affiché avec l'appareil photo (iPhone) ou avec Expo Go (Android).
   Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.

## Développement

```bash
npm install
npx expo start        # Expo Go / émulateur
npx expo start --web  # aperçu dans le navigateur
```

Les données (recettes, exercices) sont dans `data/`.
Pour ajouter des vidéos/images aux exercices, renseigne `video: { url, sizeMB }` et `image` dans `data/exercises.json`.
