import React, { useLayoutEffect, useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { exById, groupLabel } from '../../utils/exercises';
import { exerciseHistory } from '../../utils/stats';
import { fr, shortDate, fmtDate } from '../../utils/nutrition';
import ExerciseMedia from '../../components/ExerciseMedia';
import LineChart from '../../components/LineChart';
import { Card, Button, SectionTitle } from '../../components/ui';
import { s, colors } from '../../theme';

export default function ExerciseScreen({ navigation, route }) {
  const ex = exById[route.params?.id];
  const fav = useStore((st) => !!st.favorites.ex[ex?.id]);
  const logs = useStore((st) => st.logs);
  const session = useStore((st) => st.session);
  const hist = useMemo(() => (ex ? exerciseHistory(logs, ex.id) : []), [logs, ex]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: ex?.name || 'Exercice',
      headerRight: () => (
        <Pressable onPress={() => useStore.getState().toggleFav('ex', ex.id)} hitSlop={10}>
          <Ionicons name={fav ? 'star' : 'star-outline'} size={22} color={fav ? colors.yellow : colors.sub} />
        </Pressable>
      ),
    });
  }, [navigation, ex, fav]);

  if (!ex) return <View style={s.screen}><Text style={[s.text, { padding: 16 }]}>Exercice introuvable.</Text></View>;

  const best = hist.reduce((b, h) => (!b || h.e1rm > b.e1rm ? h : b), null);
  const last = hist[hist.length - 1];

  const startOrAdd = () => {
    const st = useStore.getState();
    if (!st.session) st.startSession(null, 0);
    useStore.getState().sessionAddExercise(ex.id);
    navigation.navigate('TabTraining', { screen: 'Session' });
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <ExerciseMedia ex={ex} style={{ borderRadius: 16, marginBottom: 14 }} />

      <Text style={s.h2}>{ex.name}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {[groupLabel[ex.group], ex.equipment, ex.level].map((t) => (
          <View key={t} style={{ backgroundColor: colors.card2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.text, fontSize: 13 }}>{t}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.sub, { marginTop: 10 }]}>
        Muscles : <Text style={{ color: colors.text }}>{ex.primary.join(', ')}</Text>
        {ex.secondary.length ? ` · aussi : ${ex.secondary.join(', ')}` : ''}
      </Text>

      <Button
        title={session ? 'Ajouter à la séance en cours' : 'Faire cet exercice maintenant'}
        icon={session ? 'add-circle-outline' : 'play'}
        onPress={startOrAdd}
        style={{ marginTop: 16, marginBottom: 6 }}
      />

      <SectionTitle title="Comment faire" />
      <Card>
        {ex.steps.map((st, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: i < ex.steps.length - 1 ? 12 : 0 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#08130C', fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
            </View>
            <Text style={[s.text, { flex: 1, lineHeight: 21 }]}>{st}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ borderColor: colors.accent + '55' }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Ionicons name="bulb-outline" size={20} color={colors.accent} />
          <Text style={[s.text, { flex: 1, lineHeight: 21 }]}>{ex.tip}</Text>
        </View>
      </Card>

      <Card>
        <Text style={[s.h1, { fontSize: 15, marginBottom: 8, color: colors.danger }]}>Erreurs fréquentes</Text>
        {ex.errors.map((e, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            <Text style={[s.text, { flex: 1 }]}>{e}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title="Mon historique" />
      {hist.length === 0 ? (
        <Card><Text style={s.sub}>Tu n'as pas encore fait cet exercice. Tes séries apparaîtront ici.</Text></Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1 }}>
              <Text style={s.sub}>Record (1RM estimé)</Text>
              <Text style={[s.h2, { color: colors.accent }]}>{fr(best.e1rm)} kg</Text>
              <Text style={s.sub}>{fmtDate(best.date)}</Text>
            </Card>
            <Card style={{ flex: 1 }}>
              <Text style={s.sub}>Dernière fois</Text>
              <Text style={s.h2}>{fr(last.top)} kg</Text>
              <Text style={s.sub}>{last.sets.length} série{last.sets.length > 1 ? 's' : ''} · {fmtDate(last.date)}</Text>
            </Card>
          </View>
          {hist.length >= 2 ? (
            <Card>
              <Text style={[s.sub, { marginBottom: 8, marginTop: 0 }]}>Évolution du 1RM estimé (kg)</Text>
              <LineChart points={hist.slice(-20).map((h) => ({ x: shortDate(h.date), y: h.e1rm }))} />
            </Card>
          ) : null}
          {hist.slice(-5).reverse().map((h) => (
            <Card key={h.date} style={{ paddingVertical: 10 }}>
              <Text style={[s.text, { fontWeight: '600' }]}>{fmtDate(h.date)}</Text>
              <Text style={s.sub}>{[...h.sets].reverse().map((l) => `${fr(l.weight)} kg × ${l.reps}`).join('  ·  ')}</Text>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}
