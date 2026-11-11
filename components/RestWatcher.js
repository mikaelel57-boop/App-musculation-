import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useStore } from '../store/useStore';
import { restDoneFeedback } from '../utils/feedback';
import { colors } from '../theme';

const remaining = (endAt) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
const TAB_BAR = Platform.OS === 'web' ? 56 : 52;

/**
 * Surveille le minuteur de repos quel que soit l'onglet affiché :
 * - pastille avec le temps restant (hors onglet Minuteur)
 * - signal + bandeau "Repos terminé" à la fin
 * - écran maintenu allumé pendant le repos
 */
export default function RestWatcher({ hidePill }) {
  const endAt = useStore((st) => st.timer.endAt);
  const stopTimer = useStore((st) => st.stopTimer);
  const insets = useSafeAreaInsets();
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const running = endAt !== null;

  useEffect(() => {
    if (!running) return;
    setDone(false);
    const tick = () => {
      const r = remaining(endAt);
      setLeft(r);
      if (r > 0) return;
      const late = Date.now() - endAt > 3000; // fini pendant que l'appli était fermée / en fond
      stopTimer(false);
      if (!late) { restDoneFeedback(); setDone(true); }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt]);

  // Le bandeau disparaît tout seul
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 6000);
    return () => clearTimeout(t);
  }, [done]);

  useEffect(() => {
    const off = () => Promise.resolve().then(() => deactivateKeepAwake('rest')).catch(() => {});
    if (running) activateKeepAwakeAsync('rest').catch(() => {});
    else off();
    return () => { off(); };
  }, [running]);

  const bottom = insets.bottom + TAB_BAR + 12;

  if (done) {
    return (
      <Pressable style={[styles.banner, { bottom }]} onPress={() => setDone(false)}>
        <Text style={styles.bannerTitle}>Repos terminé 💪</Text>
        <Text style={styles.bannerSub}>C'est reparti pour la prochaine série !</Text>
      </Pressable>
    );
  }
  if (running && !hidePill) {
    return (
      <View pointerEvents="box-none" style={[styles.pillWrap, { bottom }]}>
        <Pressable style={styles.pill} onPress={() => stopTimer()}>
          <Text style={styles.pillTxt}>⏱ Repos {mmss(left)}  ✕</Text>
        </Pressable>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute', left: 16, right: 16, backgroundColor: colors.accent,
    borderRadius: 14, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  bannerTitle: { color: '#08130C', fontSize: 18, fontWeight: '800' },
  bannerSub: { color: '#08130C', fontSize: 14, marginTop: 2 },
  pillWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: {
    backgroundColor: colors.card, borderColor: colors.accent, borderWidth: 1,
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
  },
  pillTxt: { color: colors.accent, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
