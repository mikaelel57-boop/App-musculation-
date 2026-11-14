import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { addDays, today, shortDate, fmtDate, num, fr } from '../utils/nutrition';
import { exById, groups } from '../utils/exercises';
import { bests, weekSummary, prSetIds } from '../utils/stats';
import LineChart from '../components/LineChart';
import ExerciseMedia from '../components/ExerciseMedia';
import { Card, Chip, Empty, Bar, SectionTitle, Button } from '../components/ui';
import { s, colors } from '../theme';

const TABS = [['poids', 'Poids'], ['records', 'Records'], ['semaine', 'Semaines'], ['historique', 'Historique']];

export default function ProgressScreen({ navigation }) {
  const [tab, setTab] = useState('poids');
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {TABS.map(([id, l]) => <Chip key={id} label={l} active={tab === id} onPress={() => setTab(id)} />)}
      </ScrollView>
      {tab === 'poids' && <Weight navigation={navigation} />}
      {tab === 'records' && <Records navigation={navigation} />}
      {tab === 'semaine' && <Weeks />}
      {tab === 'historique' && <History navigation={navigation} />}
    </ScrollView>
  );
}

function Weight({ navigation }) {
  const daily = useStore((st) => st.daily);
  const [range, setRange] = useState(30);
  const data = useMemo(() => {
    const start = range ? addDays(today(), -range + 1) : '0000';
    const pts = Object.keys(daily).sort().filter((d) => d >= start && num(daily[d].weight)).map((d) => ({ date: d, y: num(daily[d].weight) }));
    const avg = pts.map((p) => {
      const win = pts.filter((q) => q.date <= p.date && q.date > addDays(p.date, -7));
      return win.reduce((a, q) => a + q.y, 0) / win.length;
    });
    return { pts, avg };
  }, [daily, range]);

  const first = data.pts[0], last = data.pts[data.pts.length - 1];
  return (
    <>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {[[30, '30 j'], [90, '3 mois'], [365, '1 an'], [0, 'Tout']].map(([v, l]) => <Chip key={l} label={l} active={range === v} onPress={() => setRange(v)} />)}
      </View>
      {data.pts.length < 2 ? (
        <Card>
          <Empty icon="scale-outline" title="Pas encore assez de pesées" sub="Note ton poids dans le suivi quotidien (idéalement le matin à jeun)." />
          <Button title="Ajouter mon poids" onPress={() => navigation.navigate('Daily')} />
        </Card>
      ) : (
        <>
          <Card>
            <LineChart points={data.pts.map((p) => ({ x: shortDate(p.date), y: p.y }))} avg={data.avg} color={colors.orange} height={200} />
            <Text style={[s.sub, { marginTop: 6 }]}>Ligne pointillée : moyenne sur 7 jours (lisse les variations d'eau).</Text>
          </Card>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              ['Départ', `${fr(first.y)} kg`, fmtDate(first.date)],
              ['Actuel', `${fr(last.y)} kg`, fmtDate(last.date)],
              ['Évolution', `${last.y - first.y > 0 ? '+' : ''}${fr(last.y - first.y)} kg`, `${data.pts.length} pesées`],
            ].map(([l, v, sub]) => (
              <Card key={l} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 6 }}>
                <Text style={s.sub}>{l}</Text>
                <Text style={[s.h1, { marginTop: 2 }]}>{v}</Text>
                <Text style={[s.sub, { fontSize: 11 }]}>{sub}</Text>
              </Card>
            ))}
          </View>
        </>
      )}
    </>
  );
}

function Records({ navigation }) {
  const logs = useStore((st) => st.logs);
  const list = useMemo(() => Object.entries(bests(logs)).filter(([id]) => exById[id]).sort((a, b) => (a[1].date < b[1].date ? 1 : -1)), [logs]);
  if (!list.length) return <Card><Empty icon="trophy-outline" title="Aucun record pour l'instant" sub="Fais ta première séance : chaque meilleure performance sera enregistrée ici." /></Card>;
  return (
    <>
      <Text style={[s.sub, { marginTop: 0, marginBottom: 10 }]}>Meilleure performance par exercice (1RM estimé = charge max théorique sur 1 répétition).</Text>
      {list.map(([id, b]) => (
        <Pressable key={id} onPress={() => navigation.navigate('Exercise', { id })} style={({ pressed }) => [s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 }, pressed && { opacity: 0.75 }]}>
          <ExerciseMedia ex={exById[id]} thumb style={{ width: 52, height: 52, borderRadius: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[s.text, { fontWeight: '600' }]} numberOfLines={1}>{exById[id].name}</Text>
            <Text style={s.sub}>{fr(b.weight)} kg × {b.reps} · {fmtDate(b.date)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.h1, { color: colors.yellow }]}>{fr(b.e1rm, 0)} kg</Text>
            <Text style={[s.sub, { fontSize: 11 }]}>1RM est.</Text>
          </View>
        </Pressable>
      ))}
    </>
  );
}

function Weeks() {
  const logs = useStore((st) => st.logs);
  const sessions = useStore((st) => st.sessions);
  const weeks = useMemo(() => {
    const out = [];
    let ref = today();
    for (let i = 0; i < 8; i++) {
      const w = weekSummary(logs, sessions, ref);
      out.push(w);
      ref = addDays(w.start, -1);
    }
    return out;
  }, [logs, sessions]);
  const cur = weeks[0];
  const maxSessions = Math.max(4, ...weeks.map((w) => w.sessions));
  const maxSets = Math.max(10, ...Object.values(cur.perGroup));
  return (
    <>
      <SectionTitle title="Séances par semaine" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
          {[...weeks].reverse().map((w) => (
            <View key={w.start} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Text style={[s.sub, { fontSize: 11 }]}>{w.sessions}</Text>
              <View style={{ width: '70%', height: `${(w.sessions / maxSessions) * 80}%`, minHeight: 3, backgroundColor: w === cur ? colors.accent : colors.accent + '77', borderRadius: 6 }} />
              <Text style={[s.sub, { fontSize: 10 }]} numberOfLines={1}>{w.start.slice(8).replace(/^0/, '')}/{w.start.slice(5, 7).replace(/^0/, '')}</Text>
            </View>
          ))}
        </View>
      </Card>
      <SectionTitle title="Cette semaine : séries par muscle" />
      <Card>
        {Object.keys(cur.perGroup).length === 0 ? (
          <Text style={s.sub}>Aucune série cette semaine pour l'instant.</Text>
        ) : (
          groups.filter((g) => cur.perGroup[g.id]).map((g) => (
            <View key={g.id} style={{ marginBottom: 10 }}>
              <View style={[s.row, { marginBottom: 4 }]}>
                <Text style={[s.text, { fontSize: 14 }]}>{g.label}</Text>
                <Text style={[s.sub, { marginTop: 0 }]}>{cur.perGroup[g.id]} séries</Text>
              </View>
              <Bar value={cur.perGroup[g.id]} max={maxSets} />
            </View>
          ))
        )}
        <Text style={[s.sub, { marginTop: 4 }]}>Repère : 10 à 20 séries par muscle et par semaine pour progresser.</Text>
      </Card>
      <Card>
        <Text style={s.text}>Volume soulevé cette semaine</Text>
        <Text style={[s.h2, { color: colors.accent }]}>{Math.round(cur.volume).toLocaleString('fr-FR')} kg</Text>
      </Card>
    </>
  );
}

function History({ navigation }) {
  const logs = useStore((st) => st.logs);
  const removeLog = useStore((st) => st.removeLog);
  const prIds = useMemo(() => prSetIds(logs), [logs]);
  const byDate = useMemo(() => {
    const m = {};
    logs.slice(0, 400).forEach((l) => { (m[l.date] = m[l.date] || []).push(l); });
    return Object.entries(m);
  }, [logs]);
  if (!byDate.length) return <Card><Empty icon="time-outline" title="Pas encore de séries" sub="Ton historique complet apparaîtra ici." /></Card>;
  return byDate.map(([date, ls]) => (
    <Card key={date}>
      <Text style={[s.h1, { marginBottom: 6 }]}>{fmtDate(date)}</Text>
      {[...ls].reverse().map((l) => (
        <View key={l.id} style={[s.row, { paddingVertical: 5 }]}>
          <Pressable style={{ flex: 1 }} onPress={() => exById[l.exerciseId] && navigation.navigate('Exercise', { id: l.exerciseId })}>
            <Text style={s.text} numberOfLines={1}>{exById[l.exerciseId]?.name || l.exerciseName}</Text>
            <Text style={s.sub}>Série {l.set} · {fr(l.weight)} kg × {l.reps}{prIds.has(l.id) ? '  🏆 record' : ''}</Text>
          </Pressable>
          <Pressable onPress={() => removeLog(l.id)} hitSlop={8}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable>
        </View>
      ))}
    </Card>
  ));
}
