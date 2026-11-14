import { Platform } from 'react-native';
import Constants from 'expo-constants';
import data from '../data/exercises.json';

export const groups = data.groups;
export const exercises = data.exercises;
export const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));
export const groupLabel = Object.fromEntries(groups.map((g) => [g.id, g.label]));
export const EQUIPMENTS = [...new Set(exercises.map((e) => e.equipment))].sort((a, b) => a.localeCompare(b));

// Les animations sont servies avec la web app (GitHub Pages)
const PAGES = 'https://mikaelel57-boop.github.io/App-musculation-';
const base = Platform.OS === 'web' ? Constants.expoConfig?.experiments?.baseUrl || '' : PAGES;
export const mediaUrl = (ex, thumb = false) => `${base}/exercises/${ex.media}${thumb ? '-t' : ''}.webp`;

// Anciens identifiants (première version de l'appli) -> nouveaux
export const LEGACY_IDS = {
  bench: 'barbell-bench-press-medium-grip',
  fly: 'cable-crossover',
  pullup: 'pullups',
  row: 'bent-over-barbell-row',
  squat: 'barbell-squat',
  legpress: 'leg-press',
};

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function searchExercises({ q = '', group = null, equipment = null }) {
  const n = norm(q.trim());
  return exercises.filter(
    (e) =>
      (!group || e.group === group) &&
      (!equipment || e.equipment === equipment) &&
      (!n || norm(e.name).includes(n) || e.primary.some((m) => norm(m).includes(n)))
  );
}
export const normalize = norm;
