# FitApp – appli musculation

Application mobile (Expo / React Native) pour le sport :

- **Nutrition** : recettes avec calories et macros, choix des portions
- **Courses** : liste générée automatiquement à partir des recettes + articles ajoutés à la main
- **Muscu** : exercices par groupe musculaire avec conseils d'exécution
- **Minuteur** : temps de repos, avec notification même téléphone verrouillé
- **Suivi** : poids, pas, sommeil, eau au jour le jour
- **Carnet** : séries (poids × reps) avec rappel de la dernière perf ; lance le repos automatiquement

Toutes les données restent sur le téléphone.

## Installer sur iPhone (web app)

L'appli est publiée sur **https://mikaelel57-boop.github.io/App-musculation-/**

Mise en route (une seule fois, sur github.com) :
1. **Settings → General → Danger Zone → Change visibility → Public** (GitHub Pages gratuit = dépôt public).
2. **Settings → Pages → Build and deployment** : Source *Deploy from a branch*, branche **gh-pages**, dossier **/ (root)**, puis *Save*.
3. Attends 1–2 minutes que la page soit en ligne.

Sur l'iPhone :
1. Ouvre l'adresse ci-dessus **dans Safari**.
2. Bouton **Partager** (carré avec une flèche) → **Sur l'écran d'accueil** → *Ajouter*.
3. Lance FitApp depuis l'icône : elle s'ouvre en plein écran, comme une appli.

Bon à savoir :
- Les données restent sur le téléphone (dans l'appli de l'écran d'accueil). Ne supprime pas l'icône si tu veux les garder.
- Fin de repos : son + bandeau. L'écran reste allumé pendant le repos ; si tu verrouilles le téléphone, pas d'alerte (limite d'iOS pour les web apps).
- Mode silencieux activé = pas de son.
- Chaque modification poussée sur GitHub met l'appli à jour automatiquement (workflow *Deploy web app*).

## Android (APK)

Onglet **Actions → Build Android APK → Run workflow**, puis télécharge `FitApp.apk` dans les **Releases**.

## Développement

```bash
npm install
npx expo start        # Expo Go / émulateur
npx expo start --web  # aperçu dans le navigateur
```

Les données (recettes, exercices) sont dans `data/`.
Pour ajouter des vidéos/images aux exercices, renseigne `video: { url, sizeMB }` et `image` dans `data/exercises.json`.
