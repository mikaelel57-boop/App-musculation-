export const recipeMacros = (r) =>
  r.ingredients.reduce(
    (t, i) => {
      const k = i.grams / 100;
      const m = i.per100g;
      return { kcal: t.kcal + m.kcal * k, p: t.p + m.p * k, c: t.c + m.c * k, f: t.f + m.f * k };
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

// Nombre au format français (virgule décimale)
export const fr = (n, digits = 1) => String(Math.round(n * 10 ** digits) / 10 ** digits).replace('.', ',');

export const fmtGrams = (g) => (g >= 1000 ? `${fr(g / 1000, 2)} kg` : `${Math.round(g)} g`);

// Date locale au format YYYY-MM-DD (construite à la main : toLocaleDateString
// n'est pas fiable sur tous les moteurs JS mobiles)
const pad = (n) => String(n).padStart(2, '0');
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Affichage JJ/MM/AAAA
export const fmtDate = (iso) => iso.split('-').reverse().join('/');
