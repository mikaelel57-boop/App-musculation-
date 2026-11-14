import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, allPrograms } from '../../store/useStore';
import { Card, Button, SectionTitle } from '../../components/ui';
import { s, colors } from '../../theme';

export default function ProgramsScreen({ navigation }) {
  const custom = useStore((st) => st.customPrograms);
  const active = useStore((st) => st.activeProgram);
  const list = allPrograms(custom);
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={[s.sub, { marginTop: 0, marginBottom: 12 }]}>
        Choisis un programme : l'appli te propose automatiquement la séance suivante à chaque fois.
      </Text>
      {list.map((p) => (
        <Card key={p.id} onPress={() => navigation.navigate('Program', { id: p.id })} style={p.id === active && { borderColor: colors.accent }}>
          <View style={s.row}>
            <Text style={[s.h1, { flex: 1 }]}>{p.name}</Text>
            {p.id === active ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : <Ionicons name="chevron-forward" size={18} color={colors.sub} />}
          </View>
          <Text style={s.sub}>{p.custom ? 'Programme personnalisé' : `${p.level} · ${p.perWeek} séances / semaine`}</Text>
          {p.summary ? <Text style={[s.text, { marginTop: 6, fontSize: 14 }]}>{p.summary}</Text> : null}
          <Text style={[s.sub, { marginTop: 6 }]}>{p.days.map((d) => d.name).join(' · ')}</Text>
        </Card>
      ))}
      <SectionTitle title="Créer le mien" />
      <Button title="Nouveau programme" icon="add" variant="secondary" onPress={() => navigation.navigate('ProgramEdit', {})} />
    </ScrollView>
  );
}
