import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, allPrograms } from '../store/useStore';
import { targets, latestWeight, sumMacros, today, addDays, longDate, shortDate, num, fr } from '../utils/nutrition';
import { exById } from '../utils/exercises';
import { weekSummary, trainingDays, prSetIds, streak } from '../utils/stats';
import MacroBars from '../components/MacroBars';
import LineChart from '../components/LineChart';
import { Card, Ring, Button, SectionTitle, Bar } from '../components/ui';
import { s, colors } from '../theme';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Bonne nuit' : h < 18 ? 'Bonjour' : 'Bonsoir';
};

export default function TodayScreen({ navigation }) {
  const day = today();
  const profile = useStore((st) => st.profile);
  const daily = useStore((st) => st.daily);
  const meals = useStore((st) => st.meals);
  const logs = useStore((st) => st.logs);
  const sessions = useStore((st) => st.sessions);
  const session = useStore((st) => st.session);
  const activeId = useStore((st) => st.activeProgram);
  const custom = useStore((st) => st.customPrograms);
  const nextDay = useStore((st) => st.nextDay);

  const weight = latestWeight(daily, profile);
  const t = targets(profile, weight);
  const total = sumMacros(meals[day] || []);
  const d = daily[day] || {};
  const water = num(d.water) || 0;
  const steps = num(d.steps) || 0;
  const sleep = num(d.sleep) || 0;
  const profileIncomplete = !num(profile.age) || !num(profile.height) || !weight;

  const prog = allPrograms(custom).find((p) => p.id === activeId);
  const dayIdx = prog ? (nextDay[prog.id] || 0) % prog.days.length : 0;
  const nextWorkout = prog?.days[dayIdx];
  const trainedToday = sessions.some((x) => x.date === day);

  // Poids sur 30 jours + moyenne glissante 7 jours
  const weightSeries = useMemo(() => {
    const pts = [];
    for (let i = 29; i >= 0; i--) {
      const dt = addDays(day, -i);
      const w = num(daily[dt]?.weight);
      if (w) pts.push({ date: dt, y: w });
    }
    const avg = pts.map((p) => {
      const win = pts.filter((q) => q.date <= p.date && q.date > addDays(p.date, -7));
      return win.reduce((a, q) => a + q.y, 0) / win.length;
    });
    return { pts: pts.map((p) => ({ x: shortDate(p.date), y: p.y })), avg };
  }, [daily, day]);
  const trend = weightSeries.avg.length >= 2 ? weightSeries.avg[weightSeries.avg.length - 1] - weightSeries.avg[0] : null;

  const week = useMemo(() => weekSummary(logs, sessions), [logs, sessions]);
  const tDays = useMemo(() => trainingDays(logs, sessions), [logs, sessions]);
  const prsWeek = useMemo(() => {
    const ids = prSetIds(logs);
    return logs.filter((l) => l.date >= week.start && ids.has(l.id)).length;
  }, [logs, week.start]);
  const proteinStreak = streak((dt) => sumMacros(meals[dt] || []).p >= t.p * 0.9);
  const activeWeeks = useMemo(() => {
    // semaines consécutives avec au moins 2 séances
    let n = 0;
    let ref = day;
    for (let i = 0; i < 104; i++) {
      const ws = weekSummary(logs, sessions, ref);
      const ok = ws.sessions >= 2;
      if (!ok && i > 0) break;
      if (ok) n++;
      ref = addDays(ws.start, -1);
    }
    return n;
  }, [logs, sessions, day]);

  const startWorkout = () => {
    const st = useStore.getState();
    if (!st.session && prog) st.startSession(prog.id, dayIdx);
    navigation.navigate('TabTraining', { screen: 'Session', initial: false });
  };
  const goNutrition = (screen, params) => navigation.navigate('TabNutrition', { screen, params, initial: false });

  const Tile = ({ icon, color, label, value, target, unit, onPress, action }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, { flex: 1, marginBottom: 0 }, pressed && { opacity: 0.8 }]}>
      <View style={s.row}>
        <Ionicons name={icon} size={20} color={color} />
        {action}
      </View>
      <Text style={[s.h2, { marginTop: 8 }]}>{value}</Text>
      <Text style={[s.sub, { marginBottom: 8 }]}>{label}{target ? ` · obj. ${target}${unit}` : ''}</Text>
      {target ? <Bar value={num(String(value).replace(/\s/g, '')) || 0} max={num(target) || 1} color={color} height={6} /> : null}
    </Pressable>
  );

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h2}>{greeting()}{profile.name ? ` ${profile.name}` : ''} 👋</Text>
      <Text style={[s.sub, { marginBottom: 14 }]}>{longDate(day)}</Text>

      {profileIncomplete ? (
        <Card onPress={() => navigation.navigate('Profile')} style={{ borderColor: colors.orange }}>
          <View style={[s.row, { gap: 10 }]}>
            <Ionicons name="person-circle-outline" size={30} color={colors.orange} />
            <View style={{ flex: 1 }}>
              <Text style={s.h1}>Complète ton profil</Text>
              <Text style={s.sub}>Âge, taille, poids et objectif pour calculer tes besoins.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.sub} />
          </View>
        </Card>
      ) : null}

      {/* Entraînement du jour */}
      <Card style={session ? { borderColor: colors.accent } : null}>
        <View style={s.row}>
          <Text style={[s.sub, { marginTop: 0, color: colors.accent, fontWeight: '700' }]}>
            {session ? 'SÉANCE EN COURS' : trainedToday ? 'SÉANCE DU JOUR FAITE ✓' : 'SÉANCE DU JOUR'}
          </Text>
          <Ionicons name="barbell" size={18} color={colors.accent} />
        </View>
        {session ? (
          <>
            <Text style={[s.h1, { marginTop: 4 }]}>{session.name}</Text>
            <Button title="Reprendre" icon="play" onPress={startWorkout} style={{ marginTop: 12 }} />
          </>
        ) : nextWorkout ? (
          <>
            <Text style={[s.h1, { marginTop: 4 }]}>{trainedToday ? `Prochaine : ${nextWorkout.name}` : nextWorkout.name}</Text>
            <Text style={s.sub} numberOfLines={2}>{nextWorkout.items.map((i) => exById[i.ex]?.name).filter(Boolean).join(' · ')}</Text>
            <Button title={trainedToday ? 'Faire une autre séance' : 'Commencer'} variant={trainedToday ? 'secondary' : 'primary'} icon="play" onPress={startWorkout} style={{ marginTop: 12 }} />
          </>
        ) : (
          <Button title="Choisir un programme" onPress={() => navigation.navigate('TabTraining', { screen: 'Programs', initial: false })} style={{ marginTop: 10 }} />
        )}
      </Card>

      {/* Nutrition */}
      <Card onPress={() => navigation.navigate('TabNutrition')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring value={total.kcal} max={t.kcal} size={108}>
            <Text style={[s.h2, { fontSize: 21 }]}>{Math.round(total.kcal)}</Text>
            <Text style={[s.sub, { marginTop: 0, fontSize: 11 }]}>/ {t.kcal} kcal</Text>
          </Ring>
          <View style={{ flex: 1 }}><MacroBars total={total} target={t} /></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Button small variant="secondary" title="Aliment" icon="add" style={{ flex: 1 }} onPress={() => goNutrition('AddFood', { date: day })} />
          <Button small variant="secondary" title="Recette" icon="add" style={{ flex: 1 }} onPress={() => goNutrition('Recipes', { date: day, slot: undefined })} />
        </View>
      </Card>

      {/* Suivi rapide */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Tile icon="water" color={colors.cyan} label="Eau (L)" value={fr(water, 2)} target={fr(t.water)} unit=" L"
          onPress={() => useStore.getState().addWater(0.25)}
          action={<Text style={{ color: colors.cyan, fontWeight: '700' }}>+0,25</Text>} />
        <Tile icon="footsteps" color={colors.purple} label="Pas" value={steps ? String(Math.round(steps)) : '0'} target={String(t.steps)} unit=""
          onPress={() => navigation.navigate('Daily')} action={<Ionicons name="create-outline" size={16} color={colors.sub} />} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Tile icon="moon" color={colors.blue} label="Sommeil (h)" value={fr(sleep)} target={fr(t.sleep)} unit=" h"
          onPress={() => navigation.navigate('Daily')} action={<Ionicons name="create-outline" size={16} color={colors.sub} />} />
        <Tile icon="scale" color={colors.orange} label={trend != null ? `Tendance 30 j : ${trend > 0 ? '+' : ''}${fr(trend)} kg` : 'Poids (kg)'}
          value={weight ? fr(weight) : '—'} onPress={() => navigation.navigate('Daily')} action={<Ionicons name="create-outline" size={16} color={colors.sub} />} />
      </View>

      {weightSeries.pts.length >= 2 ? (
        <Card>
          <View style={[s.row, { marginBottom: 6 }]}>
            <Text style={s.h1}>Poids · 30 jours</Text>
            <Text style={[s.sub, { marginTop: 0 }]}>— moyenne 7 j</Text>
          </View>
          <LineChart points={weightSeries.pts} avg={weightSeries.avg} color={colors.orange} />
        </Card>
      ) : null}

      <SectionTitle title="Ma semaine" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          ['Séances', week.sessions, 'barbell-outline', colors.accent],
          ['Séries', week.sets, 'layers-outline', colors.blue],
          ['Records', prsWeek, 'trophy-outline', colors.yellow],
        ].map(([l, v, ic, c]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Ionicons name={ic} size={20} color={c} />
            <Text style={[s.h2, { marginTop: 4 }]}>{v}</Text>
            <Text style={s.sub}>{l}</Text>
          </Card>
        ))}
      </View>
      <Card>
        <View style={[s.row, { marginBottom: 8 }]}>
          <Text style={s.text}>🔥 Semaines actives d'affilée</Text>
          <Text style={[s.h1, { color: colors.accent }]}>{activeWeeks}</Text>
        </View>
        <View style={[s.row, { marginBottom: 8 }]}>
          <Text style={s.text}>🥩 Jours avec objectif protéines</Text>
          <Text style={[s.h1, { color: colors.blue }]}>{proteinStreak}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.text}>📅 Jours d'entraînement au total</Text>
          <Text style={[s.h1, { color: colors.text }]}>{tDays.size}</Text>
        </View>
        <Text style={[s.sub, { marginTop: 8 }]}>Semaine active = au moins 2 séances. Objectif protéines atteint à 90 % ou plus.</Text>
      </Card>
    </ScrollView>
  );
}
