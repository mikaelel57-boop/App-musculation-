import { exById } from './exercises';
import { addDays, today } from './nutrition';

// 1RM estimé (formule d'Epley)
export const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30));

// Meilleure perf par exercice : { exId: { weight, reps, e1rm, date } }
export function bests(logs) {
  const out = {};
  for (const l of logs) {
    const v = e1rm(l.weight, l.reps);
    const b = out[l.exerciseId];
    if (!b || v > b.e1rm) out[l.exerciseId] = { weight: l.weight, reps: l.reps, e1rm: v, date: l.date };
  }
  return out;
}

// Records battus : séries qui ont dépassé le meilleur 1RM estimé antérieur
export function prSetIds(logs) {
  const sorted = [...logs].sort((a, b) => (a.date === b.date ? +a.id - +b.id : a.date < b.date ? -1 : 1));
  const best = {};
  const ids = new Set();
  for (const l of sorted) {
    const v = e1rm(l.weight, l.reps);
    if (best[l.exerciseId] !== undefined && v > best[l.exerciseId] + 0.01) ids.add(l.id);
    if (best[l.exerciseId] === undefined || v > best[l.exerciseId]) best[l.exerciseId] = v;
  }
  return ids;
}

// Historique par séance pour un exercice : [{ date, best e1rm, top weight, volume }]
export function exerciseHistory(logs, exId) {
  const byDate = {};
  for (const l of logs) {
    if (l.exerciseId !== exId) continue;
    const d = (byDate[l.date] = byDate[l.date] || { date: l.date, e1rm: 0, top: 0, volume: 0, sets: [] });
    d.e1rm = Math.max(d.e1rm, e1rm(l.weight, l.reps));
    d.top = Math.max(d.top, l.weight);
    d.volume += l.weight * l.reps;
    d.sets.push(l);
  }
  return Object.values(byDate).sort((a, b) => (a.date < b.date ? -1 : 1));
}

// Lundi de la semaine d'une date ISO
export const weekStart = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return addDays(iso, -dow);
};

export function weekSummary(logs, sessions, ref = today()) {
  const start = weekStart(ref);
  const end = addDays(start, 6);
  const inWeek = (d) => d >= start && d <= end;
  const wl = logs.filter((l) => inWeek(l.date));
  const perGroup = {};
  for (const l of wl) {
    const g = exById[l.exerciseId]?.group || 'autre';
    perGroup[g] = (perGroup[g] || 0) + 1;
  }
  const days = new Set([...wl.map((l) => l.date), ...sessions.filter((s) => inWeek(s.date)).map((s) => s.date)]);
  return {
    start,
    sessions: days.size,
    sets: wl.length,
    volume: wl.reduce((t, l) => t + l.weight * l.reps, 0),
    perGroup,
  };
}

// Nombre de jours consécutifs (en remontant depuis aujourd'hui ou hier) qui vérifient pred(date)
export function streak(pred, ref = today()) {
  let d = pred(ref) ? ref : addDays(ref, -1);
  let n = 0;
  while (pred(d) && n < 3650) { n++; d = addDays(d, -1); }
  return n;
}

// Jours avec au moins une séance : streak en semaines actives est plus parlant
export function trainingDays(logs, sessions) {
  return new Set([...logs.map((l) => l.date), ...sessions.map((s) => s.date)]);
}
