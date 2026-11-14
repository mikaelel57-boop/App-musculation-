import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { exById } from '../../utils/exercises';
import { Card, Button, Stepper } from '../../components/ui';
import { s, colors } from '../../theme';

const blankDay = (n) => ({ name: `Séance ${n}`, items: [] });

export default function ProgramEditScreen({ navigation, route }) {
  const existing = useStore((st) => st.customPrograms.find((p) => p.id === route.params?.id));
  const [prog, setProg] = useState(() => existing || { name: 'Mon programme', days: [blankDay(1)], custom: true });

  // Retour de la bibliothèque avec un exercice choisi
  const picked = route.params?.picked;
  useEffect(() => {
    if (!picked) return;
    setProg((p) => ({
      ...p,
      days: p.days.map((d, i) => (i === picked.dayIdx ? { ...d, items: [...d.items, { ex: picked.id, sets: 3, reps: '8-12', rest: 90 }] } : d)),
    }));
  }, [picked?.ts]);

  const setDay = (i, patch) => setProg((p) => ({ ...p, days: p.days.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));
  const setItem = (di, ii, patch) => setDay(di, { items: prog.days[di].items.map((it, k) => (k === ii ? { ...it, ...patch } : it)) });
  const removeItem = (di, ii) => setDay(di, { items: prog.days[di].items.filter((_, k) => k !== ii) });
  const move = (di, ii, d) => {
    const items = [...prog.days[di].items];
    const j = ii + d;
    if (j < 0 || j >= items.length) return;
    [items[ii], items[j]] = [items[j], items[ii]];
    setDay(di, { items });
  };

  const valid = prog.name.trim() && prog.days.length && prog.days.every((d) => d.items.length);
  const save = () => {
    const st = useStore.getState();
    st.saveCustomProgram({ ...prog, name: prog.name.trim() });
    const saved = useStore.getState().customPrograms.find((p) => p.name === prog.name.trim() && (!prog.id || p.id === prog.id));
    if (saved) st.setActiveProgram(saved.id);
    navigation.goBack();
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={[s.sub, { marginTop: 0, marginBottom: 6 }]}>Nom du programme</Text>
      <TextInput style={s.input} value={prog.name} onChangeText={(name) => setProg({ ...prog, name })} placeholderTextColor={colors.sub} />

      {prog.days.map((d, di) => (
        <Card key={di} style={{ marginTop: 14 }}>
          <View style={[s.row, { gap: 8 }]}>
            <TextInput style={[s.input, { flex: 1, paddingVertical: 8 }]} value={d.name} onChangeText={(name) => setDay(di, { name })} />
            {prog.days.length > 1 ? (
              <Pressable onPress={() => setProg({ ...prog, days: prog.days.filter((_, j) => j !== di) })} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
          {d.items.map((it, ii) => (
            <View key={ii} style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 10 }}>
              <View style={s.row}>
                <Text style={[s.text, { flex: 1, fontWeight: '600' }]} numberOfLines={1}>{exById[it.ex]?.name}</Text>
                <Pressable onPress={() => move(di, ii, -1)} hitSlop={6}><Ionicons name="arrow-up" size={18} color={colors.sub} /></Pressable>
                <Pressable onPress={() => move(di, ii, 1)} hitSlop={6} style={{ marginLeft: 10 }}><Ionicons name="arrow-down" size={18} color={colors.sub} /></Pressable>
                <Pressable onPress={() => removeItem(di, ii)} hitSlop={6} style={{ marginLeft: 12 }}><Ionicons name="close" size={20} color={colors.danger} /></Pressable>
              </View>
              <View style={[s.row, { marginTop: 8, flexWrap: 'wrap', gap: 8 }]}>
                <Stepper value={it.sets} min={1} onChange={(v) => setItem(di, ii, { sets: v })} format={(v) => `${v} séries`} width={70} />
                <TextInput style={[s.input, { width: 90, paddingVertical: 6, textAlign: 'center' }]} value={it.reps} onChangeText={(reps) => setItem(di, ii, { reps })} placeholder="8-12" placeholderTextColor={colors.sub} />
              </View>
              <View style={[s.row, { marginTop: 8 }]}>
                <Text style={s.sub}>Repos</Text>
                <Stepper value={it.rest} min={15} step={15} onChange={(v) => setItem(di, ii, { rest: v })} format={(v) => `${v} s`} />
              </View>
            </View>
          ))}
          <Button small variant="secondary" title="Ajouter un exercice" icon="add" style={{ marginTop: 12 }}
            onPress={() => navigation.navigate('Library', { pick: 'program', dayIdx: di })} />
        </Card>
      ))}

      <Button variant="ghost" title="+ Ajouter une séance" onPress={() => setProg({ ...prog, days: [...prog.days, blankDay(prog.days.length + 1)] })} />
      <Button title="Enregistrer" icon="checkmark" onPress={save} disabled={!valid} style={{ marginTop: 8 }} />
      {!valid ? <Text style={[s.sub, { textAlign: 'center', marginTop: 8 }]}>Chaque séance doit contenir au moins un exercice.</Text> : null}
    </ScrollView>
  );
}
