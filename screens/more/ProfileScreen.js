import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useStore } from '../../store/useStore';
import { ACTIVITY, GOALS, targets, latestWeight } from '../../utils/nutrition';
import { Card, Chip, Field, SectionTitle } from '../../components/ui';
import { s, colors } from '../../theme';

export default function ProfileScreen() {
  const profile = useStore((st) => st.profile);
  const daily = useStore((st) => st.daily);
  const setProfile = useStore((st) => st.setProfile);
  const t = targets(profile, latestWeight(daily, profile));
  const f = (k) => ({ value: String(profile[k] ?? ''), onChangeText: (v) => setProfile({ [k]: v.replace(',', '.') }) });

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Field label="Prénom (facultatif)" placeholder="Ton prénom" {...f('name')} />
      <Text style={[s.sub, { marginBottom: 6 }]}>Sexe</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Chip label="Homme" active={profile.sex === 'h'} onPress={() => setProfile({ sex: 'h' })} />
        <Chip label="Femme" active={profile.sex === 'f'} onPress={() => setProfile({ sex: 'f' })} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field style={{ flex: 1 }} label="Âge" keyboardType="number-pad" placeholder="ex. 30" {...f('age')} />
        <Field style={{ flex: 1 }} label="Taille (cm)" keyboardType="number-pad" placeholder="ex. 178" {...f('height')} />
      </View>
      <Field label="Poids de départ (kg)" keyboardType="decimal-pad" placeholder="ex. 80" {...f('weight')} />
      <Text style={[s.sub, { marginTop: -6, marginBottom: 12 }]}>Ensuite, c'est ton dernier poids du suivi quotidien qui est utilisé.</Text>

      <SectionTitle title="Activité" />
      {ACTIVITY.map((a) => (
        <Card key={a.v} onPress={() => setProfile({ activity: a.v })} style={[{ paddingVertical: 10 }, profile.activity === a.v && { borderColor: colors.accent }]}>
          <Text style={[s.text, { fontWeight: '600' }]}>{a.label}</Text>
          <Text style={s.sub}>{a.sub}</Text>
        </Card>
      ))}

      <SectionTitle title="Objectif" />
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {GOALS.map((g) => <Chip key={g.id} label={g.label} active={profile.goal === g.id} onPress={() => setProfile({ goal: g.id })} />)}
      </View>

      <Card style={{ borderColor: colors.accent + '66' }}>
        <Text style={s.h1}>Tes objectifs du jour</Text>
        {t.computed ? null : <Text style={[s.sub, { color: colors.orange }]}>Remplis âge, taille et poids pour un calcul personnalisé.</Text>}
        <Text style={[s.text, { marginTop: 8 }]}>{t.kcal} kcal · {t.p} g protéines · {t.c} g glucides · {t.f} g lipides</Text>
        <Text style={s.sub}>Calcul : formule de Mifflin-St Jeor × activité, ajusté selon l'objectif.</Text>
      </Card>

      <SectionTitle title="Personnaliser (facultatif)" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field style={{ flex: 1 }} label="Calories / jour" keyboardType="number-pad" placeholder="auto" {...f('kcalTarget')} />
        <Field style={{ flex: 1 }} label="Protéines (g)" keyboardType="number-pad" placeholder="auto" {...f('proteinTarget')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field style={{ flex: 1 }} label="Eau (L)" keyboardType="decimal-pad" {...f('waterTarget')} />
        <Field style={{ flex: 1 }} label="Pas" keyboardType="number-pad" {...f('stepsTarget')} />
        <Field style={{ flex: 1 }} label="Sommeil (h)" keyboardType="decimal-pad" {...f('sleepTarget')} />
      </View>
      <Text style={[s.sub, { textAlign: 'center' }]}>Les modifications sont enregistrées automatiquement.</Text>
    </ScrollView>
  );
}
