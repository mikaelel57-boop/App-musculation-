import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { exById } from '../../utils/exercises';
import { prSetIds } from '../../utils/stats';
import { fr } from '../../utils/nutrition';
import { confirmAction } from '../../utils/feedback';
import ExerciseMedia from '../../components/ExerciseMedia';
import NumInput, { parseNum } from '../../components/NumInput';
import { Card, Button, Empty } from '../../components/ui';
import { s, colors } from '../../theme';

const repRange = (reps) => {
  const m = String(reps).match(/(\d+)\s*-\s*(\d+)/);
  if (m) return [+m[1], +m[2]];
  const n = String(reps).match(/^(\d+)/);
  return n && !/s\b/.test(reps) ? [+n[1], +n[1]] : null;
};
const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

// Dernière séance (hors séance en cours) pour un exercice
function previous(logs, exId, sessionId) {
  const prev = logs.filter((l) => l.exerciseId === exId && l.sessionId !== sessionId);
  if (!prev.length) return null;
  const date = prev[0].date;
  const sid = prev[0].sessionId;
  const sets = prev.filter((l) => (sid ? l.sessionId === sid : l.date === date)).reverse();
  return { date, sets, top: Math.max(...sets.map((l) => l.weight)) };
}

function useNow(active) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export default function SessionScreen({ navigation }) {
  const session = useStore((st) => st.session);
  const logs = useStore((st) => st.logs);
  const timer = useStore((st) => st.timer);
  const [summary, setSummary] = useState(null);
  const now = useNow(!!session || timer.endAt);

  const idx = session ? Math.min(session.cur, Math.max(0, session.items.length - 1)) : 0;
  const item = session?.items[idx];
  const ex = item ? exById[item.ex] : null;
  const prev = useMemo(() => (item ? previous(logs, item.ex, session.id) : null), [logs, item?.ex, session?.id]);
  const range = item ? repRange(item.reps) : null;

  // Suggestion de charge : +2,5 kg si toutes les reps cibles ont été faites la dernière fois
  const suggestion = useMemo(() => {
    if (!prev || !range || !item) return null;
    const hit = prev.sets.length >= item.sets && prev.sets.every((l) => l.reps >= range[1]);
    return hit ? { weight: prev.top + 2.5, text: `Objectif atteint la dernière fois : passe à ${fr(prev.top + 2.5)} kg 💪` } : null;
  }, [prev, range, item]);

  const [w, setW] = useState('');
  const [r, setR] = useState('');
  // Pré-remplissage à chaque changement d'exercice / série
  useEffect(() => {
    if (!item) return;
    const lastDone = item.done[item.done.length - 1];
    const weight = lastDone?.weight ?? suggestion?.weight ?? prev?.sets[item.done.length]?.weight ?? prev?.top ?? '';
    const reps = lastDone?.reps ?? prev?.sets[item.done.length]?.reps ?? range?.[0] ?? '';
    setW(weight === '' ? '' : fr(weight, 2));
    setR(String(reps));
  }, [item?.ex, item?.done.length, idx]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: session?.name || 'Séance' });
  }, [navigation, session?.name]);

  if (summary) return <Summary summary={summary} onClose={() => { setSummary(null); navigation.popToTop(); }} />;

  if (!session) {
    return (
      <View style={[s.screen, { padding: 16 }]}>
        <Empty icon="barbell-outline" title="Aucune séance en cours" sub="Lance une séance depuis ton programme ou fais une séance libre." />
        <Button title="Séance libre" icon="play" onPress={() => useStore.getState().startSession(null, 0)} />
      </View>
    );
  }

  const st = useStore.getState();
  const elapsed = Math.floor((now - session.startedAt) / 1000);
  const totalSets = session.items.reduce((t, it) => t + it.done.length, 0);
  const restLeft = timer.endAt ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : 0;

  const logSet = () => {
    const weight = parseNum(w);
    const reps = parseInt(r, 10);
    if (!reps || reps <= 0) return;
    st.sessionLogSet(idx, weight, reps);
    if (item.done.length + 1 < item.sets || idx < session.items.length - 1) st.startTimer(item.rest || timer.duration);
    if (item.done.length + 1 >= item.sets && idx < session.items.length - 1) {
      // Exercice terminé : on passe au suivant
      setTimeout(() => useStore.getState().sessionSetCur(idx + 1), 400);
    }
  };

  const finish = () => {
    const ids = prSetIds(useStore.getState().logs);
    const sessionIds = new Set(session.items.flatMap((it) => it.done.map((d) => d.id)));
    const prs = [...sessionIds].filter((id) => ids.has(id)).length;
    const res = useStore.getState().finishSession();
    useStore.getState().stopTimer();
    if (res) setSummary({ ...res, prs });
    else navigation.popToTop();
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={[s.row, { marginBottom: 12 }]}>
        <Text style={s.sub}>⏱ {mmss(elapsed)} · {totalSets} série{totalSets > 1 ? 's' : ''}</Text>
        <Pressable onPress={() => navigation.navigate('Library', { pick: 'add' })} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Exercice</Text>
        </Pressable>
      </View>

      {/* Navigation entre exercices */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {session.items.map((it, i) => {
          const complete = it.done.length >= it.sets;
          return (
            <Pressable key={i + it.ex} onPress={() => st.sessionSetCur(i)}
              style={[pill, i === idx && { borderColor: colors.accent }, complete && { backgroundColor: colors.accentDim }]}>
              <Text style={{ color: i === idx ? colors.accent : colors.text, fontWeight: '700' }}>{i + 1}</Text>
              <Text style={{ color: colors.sub, fontSize: 12 }}>{it.done.length}/{it.sets}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!item ? (
        <Card>
          <Empty icon="add-circle-outline" title="Séance vide" sub="Ajoute un premier exercice." />
          <Button title="Ajouter un exercice" icon="add" onPress={() => navigation.navigate('Library', { pick: 'add' })} />
        </Card>
      ) : (
        <>
          <Pressable onPress={() => navigation.navigate('Exercise', { id: ex.id })}>
            <ExerciseMedia ex={ex} style={{ borderRadius: 16 }} />
          </Pressable>
          <View style={[s.row, { marginTop: 12, alignItems: 'flex-start' }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>{ex.name}</Text>
              <Text style={s.sub}>Objectif : {item.sets} × {item.reps} · repos {item.rest || timer.duration} s</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Exercise', { id: ex.id })} hitSlop={10}>
              <Ionicons name="information-circle-outline" size={26} color={colors.sub} />
            </Pressable>
          </View>

          {prev ? (
            <Text style={[s.sub, { marginTop: 8 }]}>
              Dernière fois : {prev.sets.map((l) => `${fr(l.weight)}×${l.reps}`).join(', ')}
            </Text>
          ) : null}
          {suggestion ? <Text style={{ color: colors.accent, marginTop: 6, fontWeight: '600' }}>{suggestion.text}</Text> : null}

          {/* Séries faites */}
          <Card style={{ marginTop: 14 }}>
            {Array.from({ length: Math.max(item.sets, item.done.length) }).map((_, i) => {
              const d = item.done[i];
              return (
                <View key={i} style={[s.row, { paddingVertical: 6 }]}>
                  <Text style={[s.text, { color: d ? colors.text : colors.sub }]}>Série {i + 1}</Text>
                  <Text style={[s.text, { fontWeight: '700', color: d ? colors.accent : colors.sub }]}>
                    {d ? `${fr(d.weight)} kg × ${d.reps}` : '—'}
                  </Text>
                </View>
              );
            })}
            {item.done.length ? (
              <Pressable onPress={() => st.sessionUndoSet(idx)} style={{ marginTop: 6, alignSelf: 'flex-start' }} hitSlop={8}>
                <Text style={{ color: colors.danger, fontSize: 13 }}>Annuler la dernière série</Text>
              </Pressable>
            ) : null}
          </Card>

          {restLeft > 0 ? (
            <Pressable onPress={() => st.stopTimer()} style={[s.card, s.row, { borderColor: colors.accent }]}>
              <Text style={[s.text, { color: colors.accent, fontWeight: '700' }]}>Repos</Text>
              <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{mmss(restLeft)}</Text>
              <Text style={s.sub}>Passer ✕</Text>
            </Pressable>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <NumInput label="Poids (kg)" value={w} onChange={setW} step={2.5} />
            <NumInput label="Répétitions" value={r} onChange={setR} step={1} decimal={false} />
          </View>
          <Button title={`Valider la série ${item.done.length + 1}`} icon="checkmark" onPress={logSet} style={{ marginTop: 12 }} />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button small variant="secondary" title="Remplacer" icon="swap-horizontal" style={{ flex: 1 }}
              onPress={() => navigation.navigate('Library', { pick: 'replace', idx, group: ex.group })} />
            <Button small variant="secondary" title="Retirer" icon="trash-outline" style={{ flex: 1 }}
              onPress={() => confirmAction('Retirer cet exercice ?', 'Les séries déjà faites restent enregistrées.', 'Retirer', () => st.sessionRemoveExercise(idx))} />
          </View>
          {idx < session.items.length - 1 ? (
            <Button variant="ghost" title="Exercice suivant →" onPress={() => st.sessionSetCur(idx + 1)} style={{ marginTop: 6 }} />
          ) : null}
        </>
      )}

      <Button title="Terminer la séance" icon="flag" onPress={finish} style={{ marginTop: 20 }} />
      <Button variant="danger" small title="Abandonner la séance" style={{ marginTop: 10 }}
        onPress={() => confirmAction('Abandonner la séance ?', 'Les séries de cette séance seront supprimées.', 'Abandonner', () => { st.cancelSession(); st.stopTimer(); navigation.popToTop(); })} />
    </ScrollView>
  );
}

function Summary({ summary, onClose }) {
  const min = Math.max(1, Math.round((summary.endedAt - summary.startedAt) / 60000));
  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { alignItems: 'stretch' }]}>
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <Text style={{ fontSize: 56 }}>🏆</Text>
        <Text style={[s.h2, { marginTop: 8 }]}>Séance terminée !</Text>
        <Text style={s.sub}>{summary.dayName}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          ['Durée', `${min} min`],
          ['Séries', summary.sets],
          ['Volume', `${Math.round(summary.volume).toLocaleString('fr-FR')} kg`],
        ].map(([l, v]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.h1, { color: colors.accent }]}>{v}</Text>
            <Text style={s.sub}>{l}</Text>
          </Card>
        ))}
      </View>
      {summary.prs > 0 ? (
        <Card style={{ borderColor: colors.yellow }}>
          <Text style={[s.text, { fontWeight: '700', color: colors.yellow }]}>
            🔥 {summary.prs} record{summary.prs > 1 ? 's' : ''} battu{summary.prs > 1 ? 's' : ''} !
          </Text>
        </Card>
      ) : null}
      <Button title="Fermer" onPress={onClose} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const pill = {
  minWidth: 46, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, borderRadius: 12,
  borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center',
};
