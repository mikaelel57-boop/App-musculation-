import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useStore } from '../store/useStore';
import { s, colors } from '../theme';

const PRESETS = [30, 60, 90, 120, 180];
const MIN = 15;
const MAX = 15 * 60;
const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
const label = (t) => (t % 60 === 0 ? `${t / 60} min` : t < 60 ? `${t} s` : `${Math.floor(t / 60)} min ${t % 60}`);
const remaining = (endAt) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

export default function TimerScreen() {
  const { duration, endAt } = useStore((st) => st.timer);
  const setTimerDuration = useStore((st) => st.setTimerDuration);
  const startTimer = useStore((st) => st.startTimer);
  const stopTimer = useStore((st) => st.stopTimer);
  const running = endAt !== null;
  const [left, setLeft] = useState(running ? remaining(endAt) : duration);

  // Affichage du temps restant (la fin du repos est gérée par RestWatcher, quel que soit l'onglet)
  useEffect(() => {
    if (!running) { setLeft(duration); return; }
    const tick = () => setLeft(remaining(endAt));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt, duration]);

  const pick = (sec) => { if (!running) setTimerDuration(Math.min(MAX, Math.max(MIN, sec))); };

  return (
    <View style={[s.screen, { alignItems: 'center', padding: 16 }]}>
      <Text style={{ color: running ? colors.accent : colors.text, fontSize: 84, fontWeight: '800', marginTop: 32, fontVariant: ['tabular-nums'] }}>
        {mmss(left)}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginVertical: 24 }}>
        {PRESETS.map((p) => (
          <Pressable key={p} onPress={() => pick(p)}
            style={[s.card, { marginBottom: 0, paddingVertical: 10, paddingHorizontal: 16 }, duration === p && { borderColor: colors.accent }]}>
            <Text style={s.text}>{label(p)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Pressable style={[s.card, { marginBottom: 0 }]} onPress={() => pick(duration - 15)}><Text style={s.text}>− 15 s</Text></Pressable>
        <Pressable style={[s.card, { marginBottom: 0 }]} onPress={() => pick(duration + 15)}><Text style={s.text}>+ 15 s</Text></Pressable>
      </View>

      <Pressable style={[s.btn, { width: '80%', paddingVertical: 18 }, running && { backgroundColor: colors.danger }]}
        onPress={() => (running ? stopTimer() : startTimer())}>
        <Text style={[s.btnText, { fontSize: 18 }]}>{running ? 'Arrêter' : 'Lancer'}</Text>
      </Pressable>

      <Text style={[s.sub, { marginTop: 16, textAlign: 'center' }]}>
        {Platform.OS === 'web'
          ? "Un son et un bandeau te préviennent à la fin. L'écran reste allumé pendant le repos."
          : 'Une notification te prévient aussi si le téléphone est verrouillé.'}
      </Text>
    </View>
  );
}
