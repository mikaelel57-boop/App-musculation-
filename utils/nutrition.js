import foods from '../data/foods.json';
import recipes from '../data/recipes.json';

export const foodsById = Object.fromEntries(foods.map((f) => [f.id, f]));
export const recipesById = Object.fromEntries(recipes.map((r) => [r.id, r]));
export { foods, recipes };

const ZERO = { kcal: 0, p: 0, c: 0, f: 0 };
const add = (a, b, k = 1) => ({ kcal: a.kcal + b.kcal * k, p: a.p + b.p * k, c: a.c + b.c * k, f: a.f + b.f * k });

// Macros pour une quantité (g) d'un aliment
export const foodMacros = (food, g) => add(ZERO, food, g / 100);

// Macros d'UNE portion de recette
export const recipeMacros = (r) => {
  const total = r.ingredients.reduce((t, i) => add(t, foodsById[i.food], i.g / 100), ZERO);
  return { kcal: total.kcal / r.servings, p: total.p / r.servings, c: total.c / r.servings, f: total.f / r.servings };
};

export const sumMacros = (items) => items.reduce((t, i) => add(t, i), ZERO);

// Nombre au format français (virgule décimale)
export const fr = (n, digits = 1) => String(Math.round((+n || 0) * 10 ** digits) / 10 ** digits).replace('.', ',');
export const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const fmtGrams = (g) => (g >= 1000 ? `${fr(g / 1000, 2)} kg` : `${Math.round(g)} g`);

// Dates locales au format YYYY-MM-DD (construites à la main : toLocaleDateString
// n'est pas fiable sur tous les moteurs JS mobiles)
const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => isoDate(new Date());
export const addDays = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  return isoDate(new Date(y, m - 1, d + n));
};
export const fmtDate = (iso) => iso.split('-').reverse().join('/');
const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const out = `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]}`;
  return out[0].toUpperCase() + out.slice(1);
};
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const shortDate = (iso) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
};

export const SLOTS = [
  { id: 'matin', label: 'Petit-déjeuner', icon: 'sunny-outline' },
  { id: 'midi', label: 'Déjeuner', icon: 'restaurant-outline' },
  { id: 'collation', label: 'Collation', icon: 'nutrition-outline' },
  { id: 'soir', label: 'Dîner', icon: 'moon-outline' },
];

export const ACTIVITY = [
  { v: 1.2, label: 'Sédentaire', sub: 'Peu ou pas de sport' },
  { v: 1.375, label: 'Légèrement actif', sub: '1 à 3 séances / semaine' },
  { v: 1.55, label: 'Actif', sub: '3 à 5 séances / semaine' },
  { v: 1.725, label: 'Très actif', sub: '6 à 7 séances / semaine' },
];
export const GOALS = [
  { id: 'seche', label: 'Sèche', delta: -400, protein: 2.2 },
  { id: 'maintien', label: 'Maintien', delta: 0, protein: 1.8 },
  { id: 'masse', label: 'Prise de masse', delta: 300, protein: 2.0 },
];

// Dernier poids connu (suivi quotidien) sinon celui du profil
export const latestWeight = (daily, profile) => {
  const days = Object.keys(daily || {}).sort().reverse();
  for (const d of days) {
    const w = num(daily[d]?.weight);
    if (w) return w;
  }
  return num(profile?.weight);
};

// Objectifs du jour calculés à partir du profil (Mifflin-St Jeor)
export function targets(profile, weight) {
  const p = profile || {};
  const w = weight || num(p.weight);
  const h = num(p.height);
  const a = num(p.age);
  const goal = GOALS.find((g) => g.id === p.goal) || GOALS[1];
  let kcal = null;
  if (w && h && a) {
    const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'f' ? -161 : 5);
    kcal = Math.round((bmr * (p.activity || 1.55) + goal.delta) / 10) * 10;
  }
  const protein = w ? Math.round(w * goal.protein) : null;
  const kcalT = num(p.kcalTarget) || kcal || 2200;
  const protT = num(p.proteinTarget) || protein || 140;
  const fatT = Math.round((kcalT * 0.27) / 9);
  const carbT = Math.max(0, Math.round((kcalT - protT * 4 - fatT * 9) / 4));
  return {
    kcal: kcalT, p: protT, f: fatT, c: carbT,
    water: num(p.waterTarget) || 2.5,
    steps: num(p.stepsTarget) || 8000,
    sleep: num(p.sleepTarget) || 8,
    computed: !!kcal,
  };
}
