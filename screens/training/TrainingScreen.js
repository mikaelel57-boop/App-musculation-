import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, allPrograms } from '../../store/useStore';
import { exById, groups, exercises } from '../../utils/exercises';
import { fmtDate } from '../../utils/nutrition';
import { Card, Button, SectionTitle, ListRow } from '../../components/ui';
import { s, colors } from '../../theme';

export const nextDayOf = (st, prog) => (prog ? (st.nextDay[prog.id] || 0) % prog.days.length : 0);

export default function TrainingScreen({ navigation }) {
  const session = useStore((st) => st.session);
  const activeId = useStore((st) => st.activeProgram);
  const custom = useStore((st) => st.customPrograms);
  const nextDay = useStore((st) => st.nextDay);
  const sessions = useStore((st) => st.sessions);
  const prog = allPrograms(custom).find((p) => p.id === activeId);
  const dayIdx = prog ? (nextDay[prog.id] || 0) % prog.days.length : 0;
  const day = prog?.days[dayIdx];

  const start = (programId, idx) => {
    const st = useStore.getState();
    if (st.session) { navigation.navigate('Session'); return; }
    st.startSession(programId, idx);
    navigation.navigate('Session');
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {session ? (
        <Card onPress={() => navigation.navigate('Session')} style={{ borderColor: colors.accent }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={[s.sub, { color: colors.accent, marginTop: 0 }]}>SÉANCE EN COURS</Text>
              <Text style={s.h1}>{session.name}</Text>
              <Text style={s.sub}>{session.items.reduce((t, i) => t + i.done.length, 0)} séries faites</Text>
            </View>
            <Ionicons name="play-circle" size={40} color={colors.accent} />
          </View>
        </Card>
      ) : null}

      {prog && day ? (
        <Card>
          <Text style={[s.sub, { marginTop: 0 }]}>Programme : {prog.name}</Text>
          <Text style={[s.h2, { marginTop: 4 }]}>{day.name}</Text>
          <Text style={s.sub}>Séance {dayIdx + 1} sur {prog.days.length} · {day.items.length} exercices</Text>
          <View style={{ marginTop: 10, gap: 4 }}>
            {day.items.map((it, i) => (
              <Text key={i} style={s.text} numberOfLines={1}>
                <Text style={{ color: colors.sub }}>{it.sets} × {it.reps}  </Text>{exById[it.ex]?.name}
              </Text>
            ))}
          </View>
          <Button title={session ? 'Reprendre la séance' : 'Commencer la séance'} icon="play" onPress={() => start(prog.id, dayIdx)} style={{ marginTop: 14 }} />
          <View style={[s.row, { marginTop: 10 }]}>
            <Pressable onPress={() => navigation.navigate('Program', { id: prog.id })} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Voir le programme</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Programs')} hitSlop={8}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Changer</Text>
            </Pressable>
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={s.h1}>Aucun programme actif</Text>
          <Text style={s.sub}>Choisis un programme pour avoir ta séance du jour toute prête.</Text>
          <Button title="Choisir un programme" onPress={() => navigation.navigate('Programs')} style={{ marginTop: 12 }} />
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, alignItems: 'center' }} onPress={() => start(null, 0)}>
          <Ionicons name="flash-outline" size={26} color={colors.orange} />
          <Text style={[s.text, { fontWeight: '600', marginTop: 6 }]}>Séance libre</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('Timer')}>
          <Ionicons name="timer-outline" size={26} color={colors.blue} />
          <Text style={[s.text, { fontWeight: '600', marginTop: 6 }]}>Minuteur</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }} onPress={() => navigation.navigate('Programs')}>
          <Ionicons name="list-outline" size={26} color={colors.purple} />
          <Text style={[s.text, { fontWeight: '600', marginTop: 6 }]}>Programmes</Text>
        </Card>
      </View>

      <SectionTitle title={`Exercices (${exercises.length})`} action="Tout voir" onAction={() => navigation.navigate('Library')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {groups.map((g) => (
          <Pressable key={g.id} onPress={() => navigation.navigate('Library', { group: g.id })}
            style={({ pressed }) => [{ width: '31.5%', backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }, pressed && { opacity: 0.7 }]}>
            <Text style={[s.text, { fontWeight: '600', fontSize: 14 }]}>{g.label}</Text>
            <Text style={[s.sub, { fontSize: 12 }]}>{exercises.filter((e) => e.group === g.id).length} exos</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Dernières séances" />
      {sessions.length === 0 ? (
        <Text style={s.sub}>Tes séances terminées apparaîtront ici.</Text>
      ) : (
        sessions.slice(0, 5).map((se) => (
          <ListRow key={se.id} icon="checkmark-done" title={se.dayName}
            sub={`${fmtDate(se.date)} · ${se.sets} séries · ${Math.round(se.volume).toLocaleString('fr-FR')} kg · ${Math.max(1, Math.round((se.endedAt - se.startedAt) / 60000))} min`}
            right={null} />
        ))
      )}
    </ScrollView>
  );
}
