import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, View, Text, TextInput, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import data from '../data/exercises.json';
import { useStore } from '../store/useStore';
import { today, fmtDate } from '../utils/nutrition';
import { s, colors } from '../theme';

const all = data.muscles.flatMap((m) => m.exercises);
const kg = (n) => String(n).replace('.', ',');

export default function LogScreen() {
  const logs = useStore((st) => st.logs);
  const addLog = useStore((st) => st.addLog);
  const removeLog = useStore((st) => st.removeLog);
  const startTimer = useStore((st) => st.startTimer);
  const restSec = useStore((st) => st.timer.duration);
  const [ex, setEx] = useState(all[0]);
  const [w, setW] = useState('');
  const [reps, setReps] = useState('');
  const [autoRest, setAutoRest] = useState(true);
  const day = today();

  const last = logs.find((l) => l.exerciseId === ex.id); // dernière perf (logs = récent d'abord)
  // Numéro de série = plus grand numéro du jour + 1 (reste correct après une suppression)
  const setNo = useMemo(
    () => logs.reduce((mx, l) => (l.exerciseId === ex.id && l.date === day ? Math.max(mx, l.set) : mx), 0) + 1,
    [logs, ex.id, day]
  );

  const choose = (e) => {
    setEx(e);
    const prev = logs.find((l) => l.exerciseId === e.id);
    setW(prev ? kg(prev.weight) : '');
    setReps('');
  };

  const add = () => {
    const weight = parseFloat(w.replace(',', '.'));
    const r = parseInt(reps, 10);
    if (isNaN(weight) || isNaN(r) || r <= 0) return;
    addLog({ id: Date.now().toString(), date: day, exerciseId: ex.id, exerciseName: ex.name, set: setNo, weight, reps: r });
    setReps('');
    if (autoRest) startTimer();
  };

  return (
    <FlatList
      style={s.screen}
      data={logs}
      keyExtractor={(l) => l.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} keyboardShouldPersistTaps="handled">
            {all.map((e) => (
              <Pressable key={e.id} onPress={() => choose(e)}
                style={[s.card, { marginBottom: 0, marginRight: 8, paddingVertical: 8 }, ex.id === e.id && { borderColor: colors.accent }]}>
                <Text style={s.text}>{e.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={s.sub}>
            {last ? `Dernière fois : ${kg(last.weight)} kg × ${last.reps} (${fmtDate(last.date)})` : 'Pas encore de performance enregistrée'}
          </Text>
          <Text style={[s.h1, { marginVertical: 8 }]}>Série {setNo}</Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[s.input, { flex: 1, minWidth: 0 }]} placeholder="Poids (kg)" placeholderTextColor={colors.sub}
              keyboardType="decimal-pad" value={w} onChangeText={setW} />
            <TextInput style={[s.input, { flex: 1, minWidth: 0 }]} placeholder="Reps" placeholderTextColor={colors.sub}
              keyboardType="number-pad" value={reps} onChangeText={setReps} onSubmitEditing={add} />
            <Pressable style={s.btn} onPress={add}><Text style={s.btnText}>+</Text></Pressable>
          </View>

          <View style={[s.row, { marginTop: 12 }]}>
            <Text style={s.sub}>Lancer le repos ({restSec} s) après chaque série</Text>
            <Switch value={autoRest} onValueChange={setAutoRest} />
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={s.sub}>Tes séries apparaîtront ici.</Text>}
      renderItem={({ item }) => (
        <View style={[s.card, s.row, { paddingVertical: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.text}>{item.exerciseName} · série {item.set}</Text>
            <Text style={s.sub}>{fmtDate(item.date)} — {kg(item.weight)} kg × {item.reps}</Text>
          </View>
          <Pressable onPress={() => removeLog(item.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        </View>
      )}
    />
  );
}
