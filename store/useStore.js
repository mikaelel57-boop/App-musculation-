import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleRestEnd, cancelRestEnd } from '../utils/restTimer';
import { unlockAudio } from '../utils/feedback';
import { LEGACY_IDS, exById } from '../utils/exercises';
import { today } from '../utils/nutrition';
import programsData from '../data/programs.json';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const DEFAULT_PROFILE = {
  name: '', sex: 'h', age: '', height: '', weight: '', activity: 1.55, goal: 'maintien',
  kcalTarget: '', proteinTarget: '', waterTarget: '2.5', stepsTarget: '8000', sleepTarget: '8',
};

// Données sauvegardées (tout le reste est recalculé)
const PERSISTED = ['profile', 'daily', 'meals', 'logs', 'sessions', 'activeProgram', 'nextDay', 'customPrograms',
  'session', 'favorites', 'selected', 'checked', 'manual', 'timer', 'onboarded'];

export const allPrograms = (custom) => [...programsData, ...(custom || [])];

export const useStore = create(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      profile: DEFAULT_PROFILE,
      daily: {},        // { "2026-10-27": { weight, steps, sleep, water } }
      meals: {},        // { "2026-10-27": [{ id, slot, kind, ref, qty, name, kcal, p, c, f }] }
      logs: [],         // séries : [{ id, date, exerciseId, exerciseName, set, weight, reps, sessionId }] (récent d'abord)
      sessions: [],     // séances terminées : [{ id, date, startedAt, endedAt, programId, dayName, sets, volume }]
      activeProgram: 'fullbody3',
      nextDay: {},      // { programId: index du prochain jour }
      customPrograms: [],
      session: null,    // séance en cours
      favorites: { ex: {}, recipes: {} },
      selected: {},     // courses : { recipeId: nombre de portions }
      checked: {},
      manual: [],
      timer: { duration: 90, endAt: null, notifId: null },

      // ---- Profil & suivi quotidien --------------------------------------------------
      setProfile: (patch) => set((st) => ({ profile: { ...st.profile, ...patch } })),
      setOnboarded: () => set({ onboarded: true }),
      saveDaily: (date, data) => set((st) => ({ daily: { ...st.daily, [date]: { ...(st.daily[date] || {}), ...data } } })),
      addWater: (liters, date = today()) =>
        set((st) => {
          const cur = parseFloat(String(st.daily[date]?.water || 0).replace(',', '.')) || 0;
          const water = Math.max(0, Math.round((cur + liters) * 100) / 100);
          return { daily: { ...st.daily, [date]: { ...(st.daily[date] || {}), water: String(water) } } };
        }),

      // ---- Journal alimentaire --------------------------------------------------------
      addMeal: (date, entry) =>
        set((st) => ({ meals: { ...st.meals, [date]: [...(st.meals[date] || []), { id: uid(), ...entry }] } })),
      removeMeal: (date, id) =>
        set((st) => ({ meals: { ...st.meals, [date]: (st.meals[date] || []).filter((m) => m.id !== id) } })),

      // ---- Favoris -----------------------------------------------------------------
      toggleFav: (kind, id) =>
        set((st) => {
          const cur = { ...st.favorites[kind] };
          if (cur[id]) delete cur[id]; else cur[id] = true;
          return { favorites: { ...st.favorites, [kind]: cur } };
        }),

      // ---- Courses -----------------------------------------------------------------
      setPortions: (id, n) =>
        set((st) => {
          const selected = { ...st.selected };
          if (n <= 0) delete selected[id];
          else selected[id] = n;
          return { selected };
        }),
      toggleChecked: (key) => set((st) => ({ checked: { ...st.checked, [key]: !st.checked[key] } })),
      addManual: (name) => set((st) => ({ manual: [...st.manual, { id: uid(), name, checked: false }] })),
      toggleManual: (id) =>
        set((st) => ({ manual: st.manual.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)) })),
      removeManual: (id) => set((st) => ({ manual: st.manual.filter((m) => m.id !== id) })),
      resetChecked: () => set((st) => ({ checked: {}, manual: st.manual.filter((m) => !m.checked) })),
      clearShopping: () => set({ selected: {}, checked: {}, manual: [] }),

      // ---- Programmes ----------------------------------------------------------------
      setActiveProgram: (id) => set({ activeProgram: id }),
      saveCustomProgram: (prog) =>
        set((st) => {
          const exists = st.customPrograms.some((p) => p.id === prog.id);
          return {
            customPrograms: exists
              ? st.customPrograms.map((p) => (p.id === prog.id ? prog : p))
              : [...st.customPrograms, { ...prog, id: prog.id || 'perso-' + uid(), custom: true }],
          };
        }),
      deleteCustomProgram: (id) =>
        set((st) => ({
          customPrograms: st.customPrograms.filter((p) => p.id !== id),
          activeProgram: st.activeProgram === id ? 'fullbody3' : st.activeProgram,
        })),

      // ---- Séance en cours ----------------------------------------------------------
      startSession: (programId, dayIdx) => {
        const prog = programId ? allPrograms(get().customPrograms).find((p) => p.id === programId) : null;
        const day = prog?.days[dayIdx];
        set({
          session: {
            id: uid(),
            programId: prog?.id || null,
            dayIdx: prog ? dayIdx : null,
            name: day?.name || 'Séance libre',
            startedAt: Date.now(),
            cur: 0,
            items: (day?.items || []).filter((i) => exById[i.ex]).map((i) => ({ ...i, done: [] })),
          },
        });
      },
      sessionAddExercise: (exId) =>
        set((st) => st.session && {
          session: { ...st.session, items: [...st.session.items, { ex: exId, sets: 3, reps: '8-12', rest: st.timer.duration, done: [] }], cur: st.session.items.length },
        }),
      sessionReplaceExercise: (idx, exId) =>
        set((st) => st.session && {
          session: { ...st.session, items: st.session.items.map((it, i) => (i === idx ? { ...it, ex: exId, done: [] } : it)) },
        }),
      sessionRemoveExercise: (idx) =>
        set((st) => {
          if (!st.session) return {};
          const items = st.session.items.filter((_, i) => i !== idx);
          return { session: { ...st.session, items, cur: Math.min(st.session.cur, Math.max(0, items.length - 1)) } };
        }),
      sessionSetCur: (cur) => set((st) => st.session && { session: { ...st.session, cur } }),
      sessionLogSet: (idx, weight, reps) => {
        const st = get();
        const s = st.session;
        if (!s) return;
        const item = s.items[idx];
        const ex = exById[item.ex];
        const date = today();
        const setNo = item.done.length + 1;
        const log = { id: uid(), date, exerciseId: item.ex, exerciseName: ex?.name || item.ex, set: setNo, weight, reps, sessionId: s.id };
        set({
          logs: [log, ...st.logs],
          session: { ...s, items: s.items.map((it, i) => (i === idx ? { ...it, done: [...it.done, { id: log.id, weight, reps }] } : it)) },
        });
        return log;
      },
      sessionUndoSet: (idx) =>
        set((st) => {
          const s = st.session;
          if (!s) return {};
          const item = s.items[idx];
          const last = item.done[item.done.length - 1];
          if (!last) return {};
          return {
            logs: st.logs.filter((l) => l.id !== last.id),
            session: { ...s, items: s.items.map((it, i) => (i === idx ? { ...it, done: it.done.slice(0, -1) } : it)) },
          };
        }),
      finishSession: () => {
        const st = get();
        const s = st.session;
        if (!s) return null;
        const sets = s.items.reduce((t, it) => t + it.done.length, 0);
        const volume = s.items.reduce((t, it) => t + it.done.reduce((v, d) => v + d.weight * d.reps, 0), 0);
        const summary = {
          id: s.id, date: today(), startedAt: s.startedAt, endedAt: Date.now(), programId: s.programId,
          dayName: s.name, sets, volume, exercises: s.items.filter((it) => it.done.length).length,
        };
        const nextDay = { ...st.nextDay };
        if (s.programId != null && sets > 0) {
          const prog = allPrograms(st.customPrograms).find((p) => p.id === s.programId);
          if (prog) nextDay[s.programId] = (s.dayIdx + 1) % prog.days.length;
        }
        set({ session: null, sessions: sets > 0 ? [summary, ...st.sessions] : st.sessions, nextDay });
        return sets > 0 ? summary : null;
      },
      cancelSession: () =>
        set((st) => {
          const s = st.session;
          if (!s) return {};
          const ids = new Set(s.items.flatMap((it) => it.done.map((d) => d.id)));
          return { session: null, logs: st.logs.filter((l) => !ids.has(l.id)) };
        }),
      removeLog: (id) => set((st) => ({ logs: st.logs.filter((l) => l.id !== id) })),

      // ---- Minuteur de repos ----------------------------------------------------------
      setTimerDuration: (duration) => set((st) => ({ timer: { ...st.timer, duration } })),
      startTimer: async (duration) => {
        unlockAudio(); // doit rester synchrone dans le geste (Safari)
        const st = get();
        const d = duration ?? st.timer.duration;
        await cancelRestEnd(st.timer.notifId);
        set((s2) => ({ timer: { ...s2.timer, endAt: Date.now() + d * 1000, notifId: null, last: d } }));
        const notifId = await scheduleRestEnd(d);
        set((s2) => ({ timer: { ...s2.timer, notifId } }));
      },
      stopTimer: (cancelNotif = true) => {
        const { notifId } = get().timer;
        if (cancelNotif) cancelRestEnd(notifId);
        set((st) => ({ timer: { ...st.timer, endAt: null, notifId: null } }));
      },

      // ---- Sauvegarde ------------------------------------------------------------------
      exportData: () => {
        const st = get();
        return { app: 'FitApp', version: 2, exportedAt: new Date().toISOString(), data: Object.fromEntries(PERSISTED.map((k) => [k, st[k]])) };
      },
      importData: (json) => {
        const d = json?.data;
        if (!d || json.app !== 'FitApp') throw new Error('Fichier non reconnu');
        set(migrate(Object.fromEntries(PERSISTED.filter((k) => k in d).map((k) => [k, d[k]])), json.version || 1));
      },
    }),
    {
      name: 'fitapp-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (st) => Object.fromEntries(PERSISTED.map((k) => [k, st[k]])),
      migrate: (state, version) => migrate(state, version),
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    }
  )
);

// Mise à jour des données d'une ancienne version de l'appli, sans rien perdre
function migrate(state, version) {
  const s = { ...(state || {}) };
  if (version < 2) {
    s.logs = (s.logs || []).map((l) => ({ ...l, exerciseId: LEGACY_IDS[l.exerciseId] || l.exerciseId }));
    // Les anciennes listes de courses utilisaient le nom de l'ingrédient comme clé : on repart propre
    s.checked = {};
    delete s.dataSaver;
    // Un utilisateur qui avait déjà des données n'a pas besoin de l'écran d'accueil
    if ((s.logs || []).length || Object.keys(s.daily || {}).length) s.onboarded = true;
  }
  s.profile = { ...DEFAULT_PROFILE, ...(s.profile || {}) };
  s.favorites = { ex: {}, recipes: {}, ...(s.favorites || {}) };
  if (s.timer) s.timer = { duration: 90, ...s.timer, endAt: null, notifId: null };
  return s;
}
