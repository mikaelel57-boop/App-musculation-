import React, { useState } from 'react';
import { SectionList, View, Text, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import data from '../data/exercises.json';
import AdaptiveMedia from '../components/AdaptiveMedia';
import { useStore } from '../store/useStore';
import { s, colors } from '../theme';

const sections = data.muscles.map((m) => ({ title: m.label, data: m.exercises }));
const hasMedia = data.muscles.some((m) => m.exercises.some((e) => e.video?.url || e.image));

function ExerciseRow({ ex }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.card}>
      <Pressable style={s.row} onPress={() => setOpen(!open)}>
        <View>
          <Text style={s.h1}>{ex.name}</Text>
          <Text style={s.sub}>{ex.equipment}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.sub} />
      </Pressable>
      {/* Le média ne se charge qu'à l'ouverture de l'exercice */}
      {open && (
        <>
          {(ex.video?.url || ex.image) && <AdaptiveMedia
            videoUrl={ex.video?.url}
            sizeMB={ex.video?.sizeMB}
            imageUrl={ex.image}
            style={{ height: 200, borderRadius: 10, marginTop: 10, overflow: 'hidden', backgroundColor: '#000' }}
          />}
          <Text style={[s.sub, { marginTop: 8 }]}>{ex.tips}</Text>
        </>
      )}
    </View>
  );
}

export default function WorkoutScreen() {
  const dataSaver = useStore((st) => st.dataSaver);
  const setDataSaver = useStore((st) => st.setDataSaver);
  return (
    <SectionList
      style={s.screen}
      sections={sections}
      keyExtractor={(e) => e.id}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        hasMedia ? (
          <View style={[s.row, { marginBottom: 12 }]}>
            <Text style={s.text}>Économie de données (images)</Text>
            <Switch value={dataSaver} onValueChange={setDataSaver} />
          </View>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <Text style={[s.h1, { color: colors.accent, marginVertical: 8 }]}>{section.title}</Text>
      )}
      renderItem={({ item }) => <ExerciseRow ex={item} />}
    />
  );
}
