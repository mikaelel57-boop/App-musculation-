import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { groups, groupLabel, EQUIPMENTS, searchExercises } from '../../utils/exercises';
import ExerciseMedia from '../../components/ExerciseMedia';
import { Chip, Empty } from '../../components/ui';
import { s, colors } from '../../theme';

/**
 * Bibliothèque d'exercices.
 * params.pick : 'add' (séance) | 'replace' (séance, params.idx) | 'program' (params.dayIdx)
 * params.group : groupe musculaire présélectionné
 */
export default function LibraryScreen({ navigation, route }) {
  const pick = route.params?.pick;
  const [q, setQ] = useState('');
  const [group, setGroup] = useState(route.params?.group ?? null);
  const [equipment, setEquipment] = useState(null);
  const [favOnly, setFavOnly] = useState(false);
  const favs = useStore((st) => st.favorites.ex);

  const list = useMemo(() => {
    const r = searchExercises({ q, group, equipment });
    return favOnly ? r.filter((e) => favs[e.id]) : r;
  }, [q, group, equipment, favOnly, favs]);

  const choose = (ex) => {
    const st = useStore.getState();
    if (pick === 'add') { st.sessionAddExercise(ex.id); navigation.goBack(); return; }
    if (pick === 'replace') { st.sessionReplaceExercise(route.params.idx, ex.id); navigation.goBack(); return; }
    if (pick === 'program') {
      navigation.popTo('ProgramEdit', { picked: { id: ex.id, dayIdx: route.params.dayIdx, ts: Date.now() } }, { merge: true });
      return;
    }
    navigation.push('Exercise', { id: ex.id });
  };

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={list}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      initialNumToRender={12}
      ListHeaderComponent={
        <View>
          {pick ? (
            <Text style={[s.sub, { marginBottom: 10, marginTop: 0 }]}>
              {pick === 'replace' ? 'Choisis l\'exercice de remplacement' : 'Choisis un exercice à ajouter'}
            </Text>
          ) : null}
          <View style={[s.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 0 }]}>
            <Ionicons name="search" size={18} color={colors.sub} />
            <TextInput
              style={{ flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12, minWidth: 0 }}
              placeholder="Rechercher (ex. curl, squat, pecs…)"
              placeholderTextColor={colors.sub}
              value={q}
              onChangeText={setQ}
              autoCorrect={false}
            />
            {q ? <Pressable onPress={() => setQ('')} hitSlop={10}><Ionicons name="close-circle" size={18} color={colors.sub} /></Pressable> : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} keyboardShouldPersistTaps="handled">
            <Chip label="Tous" active={!group && !favOnly} onPress={() => { setGroup(null); setFavOnly(false); }} />
            <Chip label="Favoris" icon="star" active={favOnly} onPress={() => setFavOnly(!favOnly)} />
            {groups.map((g) => (
              <Chip key={g.id} label={g.label} active={group === g.id} onPress={() => setGroup(group === g.id ? null : g.id)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 12 }} keyboardShouldPersistTaps="handled">
            {EQUIPMENTS.map((e) => (
              <Chip key={e} label={e} active={equipment === e} onPress={() => setEquipment(equipment === e ? null : e)} />
            ))}
          </ScrollView>
          <Text style={[s.sub, { marginBottom: 8 }]}>{list.length} exercice{list.length > 1 ? 's' : ''}</Text>
        </View>
      }
      ListEmptyComponent={<Empty icon="search-outline" title="Aucun exercice trouvé" sub="Essaie un autre mot ou enlève un filtre." />}
      renderItem={({ item }) => (
        <Pressable onPress={() => choose(item)} style={({ pressed }) => [s.card, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 }, pressed && { opacity: 0.75 }]}>
          <ExerciseMedia ex={item} thumb style={{ width: 64, height: 64, borderRadius: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[s.text, { fontWeight: '600' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={s.sub} numberOfLines={1}>{groupLabel[item.group]} · {item.equipment} · {item.level}</Text>
          </View>
          {favs[item.id] ? <Ionicons name="star" size={16} color={colors.yellow} /> : null}
          <Ionicons name={pick ? 'add-circle' : 'chevron-forward'} size={pick ? 24 : 18} color={pick ? colors.accent : colors.sub} />
        </Pressable>
      )}
    />
  );
}
