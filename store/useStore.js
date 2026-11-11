import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleRestEnd, cancelRestEnd } from '../utils/restTimer';

export const useStore = create(
  persist(
    (set) => ({
      hydrated: false, // true une fois les données sauvegardées rechargées
      selected: {},   // { recipeId: multiplicateur }
      checked: {},    // { "a:Nom ingrédient": true }
      manual: [],     // [{ id, name, checked }]
      daily: {},      // { "2026-10-27": { weight, steps, sleep, water } }
      logs: [],       // [{ id, date, exerciseId, exerciseName, set, weight, reps }] (récent d'abord)
      dataSaver: false,
      // Minuteur de repos partagé (l'écran Carnet peut le lancer après une série)
      timer: { duration: 90, endAt: null, notifId: null },

      setPortions: (id, n) =>
        set((st) => {
          const selected = { ...st.selected };
          if (n <= 0) delete selected[id];
          else selected[id] = n;
          return { selected };
        }),
      toggleChecked: (key) => set((st) => ({ checked: { ...st.checked, [key]: !st.checked[key] } })),

      addManual: (name) =>
        set((st) => ({ manual: [...st.manual, { id: Date.now().toString(), name, checked: false }] })),
      toggleManual: (id) =>
        set((st) => ({ manual: st.manual.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)) })),
      removeManual: (id) => set((st) => ({ manual: st.manual.filter((m) => m.id !== id) })),
      // Décoche tout et retire les articles cochés ajoutés à la main
      resetChecked: () => set((st) => ({ checked: {}, manual: st.manual.filter((m) => !m.checked) })),
      // Nouvelle liste : plus aucune recette sélectionnée ni article manuel
      clearShopping: () => set({ selected: {}, checked: {}, manual: [] }),

      saveDaily: (date, data) => set((st) => ({ daily: { ...st.daily, [date]: data } })),

      addLog: (log) => set((st) => ({ logs: [log, ...st.logs] })),
      removeLog: (id) => set((st) => ({ logs: st.logs.filter((l) => l.id !== id) })),

      setDataSaver: (v) => set({ dataSaver: v }),

      setTimerDuration: (duration) => set((st) => ({ timer: { ...st.timer, duration } })),
      startTimer: async (duration) => {
        const st = useStore.getState();
        const d = duration ?? st.timer.duration;
        await cancelRestEnd(st.timer.notifId);
        set({ timer: { duration: d, endAt: Date.now() + d * 1000, notifId: null } });
        const notifId = await scheduleRestEnd(d);
        set((s2) => ({ timer: { ...s2.timer, notifId } }));
      },
      stopTimer: (cancelNotif = true) => {
        const { notifId } = useStore.getState().timer;
        if (cancelNotif) cancelRestEnd(notifId);
        set((st) => ({ timer: { ...st.timer, endAt: null, notifId: null } }));
      },
    }),
    {
      name: 'fitapp-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    }
  )
);
