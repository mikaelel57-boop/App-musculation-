# FitApp – appli musculation

Application mobile (Expo / React Native) pour suivre tout son quotidien sportif. Elle s'utilise sur iPhone comme web app (écran d'accueil) et compile aussi pour Android.

- **Aujourd'hui** : tableau de bord du jour (calories et macros par rapport aux objectifs, séance du jour, eau, pas, sommeil, poids et tendance sur 30 jours, bilan de la semaine, séries en cours)
- **Entraînement** :
  - 230 exercices pour tous les muscles, avec animation, consignes en français, erreurs fréquentes et conseil clé
  - recherche et filtres par muscle et matériel, favoris
  - 5 programmes prêts (full body, haut/bas, PPL, maison poids du corps, maison haltères) + création de son propre programme
  - séance guidée : dernière perf et suggestion de charge, saisie poids × reps, minuteur de repos automatique, remplacement d'exercice, résumé avec records
- **Nutrition** : journal par repas, 109 aliments, 45 recettes muscu (étapes, macros par portion, filtres), objectifs calculés depuis le profil, liste de courses rangée par rayon
- **Progrès** : courbe de poids (moyenne 7 j), records (1RM estimé), séances par semaine, séries par muscle, historique complet
- **Plus** : profil et objectifs, suivi quotidien, courses, minuteur, sauvegarde / restauration (fichier JSON), crédits

Toutes les données restent sur le téléphone : pense à exporter une sauvegarde de temps en temps.

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

Données statiques dans `data/` : `exercises.json`, `programs.json`, `foods.json`, `recipes.json`.

Les exercices sont générés par `scripts/build_exercises.py` à partir des fiches françaises `scripts/exercises_fr_*.txt`
et des photos de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (domaine public) :

```bash
git clone --depth 1 https://github.com/yuhonas/free-exercise-db /tmp/fedb
python3 scripts/build_exercises.py /tmp/fedb   # -> data/exercises.json + public/exercises/*.webp
```
