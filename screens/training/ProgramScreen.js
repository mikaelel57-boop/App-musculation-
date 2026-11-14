import React, { useLayoutEffect } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useStore, allPrograms } from '../../store/useStore';
import { exById } from '../../utils/exercises';
import { confirmAction } from '../../utils/feedback';
import ExerciseMedia from '../../components/ExerciseMedia';
import { Card, Button } from '../../components/ui';
import { s, colors } from '../../theme';

export default function ProgramScreen({ navigation, route }) {
  const custom = useStore((st) => st.customPrograms);
  const active = useStore((st) => st.activeProgram);
  const nextDay = useStore((st) => st.nextDay);
  const prog = allPrograms(custom).find((p) => p.id === route.params?.id);

  useLayoutEffect(() => { navigation.setOptions({ title: prog?.name || 'Programme' }); }, [navigation, prog?.name]);
  if (!prog) return <View style={s.screen}><Text style={[s.text, { padding: 16 }]}>Programme supprimé.</Text></View>;

  const st = useStore.getState();
  const isActive = prog.id === active;
  const next = (nextDay[prog.id] || 0) % prog.days.length;

  const startDay = (i) => {
    if (useStore.getState().session) { navigation.navigate('Session'); return; }
    st.setActiveProgram(prog.id);
    st.startSession(prog.id, i);
    navigation.navigate('Session');
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {prog.summary ? <Text style={[s.text, { marginBottom: 12 }]}>{prog.summary}</Text> : null}
      {isActive ? (
        <Text style={{ color: colors.accent, fontWeight: '700', marginBottom: 12 }}>✓ Programme actif</Text>
      ) : (
        <Button title="Choisir ce programme" icon="checkmark" onPress={() => { st.setActiveProgram(prog.id); navigation.goBack(); }} style={{ marginBottom: 12 }} />
      )}
      {prog.days.map((d, i) => (
        <Card key={i} style={isActive && i === next && { borderColor: colors.accent }}>
          <View style={s.row}>
            <Text style={[s.h1, { flex: 1 }]}>{d.name}</Text>
            {isActive && i === next ? <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>PROCHAINE</Text> : null}
          </View>
          {d.items.map((it, j) => {
            const ex = exById[it.ex];
            if (!ex) return null;
            return (
              <Pressable key={j} onPress={() => navigation.navigate('Exercise', { id: ex.id })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <ExerciseMedia ex={ex} thumb style={{ width: 44, height: 44, borderRadius: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.text} numberOfLines={1}>{ex.name}</Text>
                  <Text style={s.sub}>{it.sets} × {it.reps} · repos {it.rest} s</Text>
                </View>
              </Pressable>
            );
          })}
          <Button small variant="secondary" title="Faire cette séance" icon="play" onPress={() => startDay(i)} style={{ marginTop: 12 }} />
        </Card>
      ))}
      {prog.custom ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="secondary" title="Modifier" icon="create-outline" style={{ flex: 1 }} onPress={() => navigation.navigate('ProgramEdit', { id: prog.id })} />
          <Button variant="danger" title="Supprimer" icon="trash-outline" style={{ flex: 1 }}
            onPress={() => confirmAction('Supprimer ce programme ?', prog.name, 'Supprimer', () => { st.deleteCustomProgram(prog.id); navigation.goBack(); })} />
        </View>
      ) : null}
    </ScrollView>
  );
}
