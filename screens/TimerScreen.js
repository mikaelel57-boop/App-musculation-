import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
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

  // Basé sur l'heure de fin : pas de dérive, et le décompte reprend juste après une mise en arrière-plan.
  useEffect(() => {
    if (!running) { setLeft(duration); return; }
    const tick = () => {
      const r = remaining(endAt);
      setLeft(r);
      if (r > 0) return;
      const late = Date.now() - endAt > 2000; // fini pendant que l'appli était en fond : la notification a déjà prévenu
      stopTimer(false);
      if (!late) {
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Repos terminé 💪', "C'est reparti pour la prochaine série !");
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endAt, duration]);

  useEffect(() => {
    // Garde l'écran allumé pendant le repos (échec sans gravité : on ignore)
    const off = () => Promise.resolve().then(() => deactivateKeepAwake('timer')).catch(() => {});
    if (running) activateKeepAwakeAsync('timer').catch(() => {});
    else off();
    return () => { off(); };
  }, [running]);

  const pick = (sec) => { if (!running) setTimerDuration(Math.min(MAX, Math.max(MIN, sec))); };

  return (
    <View style={[s.screen, { alignItems: 'center' }]}>
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
        Une notification te prévient aussi si le téléphone est verrouillé.
      </Text>
    </View>
  );
}
