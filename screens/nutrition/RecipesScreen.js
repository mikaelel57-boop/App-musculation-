import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { recipes, recipeMacros } from '../../utils/nutrition';
import { normalize } from '../../utils/exercises';
import { Chip, Empty } from '../../components/ui';
import { s, colors, macroColors } from '../../theme';

const CATS = ['Petit-déjeuner', 'Plat', 'Batch cooking', 'Collation', 'Dessert'];
const withMacros = recipes.map((r) => ({ ...r, m: recipeMacros(r) }));

export default function RecipesScreen({ navigation, route }) {
  const { date, slot } = route.params || {};
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [filter, setFilter] = useState(null); // proteines | leger | rapide | budget | favoris
  const favs = useStore((st) => st.favorites.recipes);

  const list = useMemo(() => {
    const n = normalize(q.trim());
    return withMacros.filter((r) =>
      (!cat || r.category === cat) &&
      (!n || normalize(r.name).includes(n) || r.ingredients.some((i) => i.food.includes(n))) &&
      (filter !== 'proteines' || r.m.p >= 35) &&
      (filter !== 'leger' || r.m.kcal <= 450) &&
      (filter !== 'rapide' || r.minutes <= 15) &&
      (filter !== 'budget' || r.budget) &&
      (filter !== 'favoris' || favs[r.id])
    );
  }, [q, cat, filter, favs]);

  const F = (id, label, icon) => <Chip key={id} label={label} icon={icon} active={filter === id} onPress={() => setFilter(filter === id ? null : id)} />;

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={list}
      keyExtractor={(r) => r.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ marginBottom: 6 }}>
          {slot ? <Text style={[s.sub, { marginTop: 0, marginBottom: 8 }]}>Choisis la recette à ajouter à ton journal</Text> : null}
          <View style={[s.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 0 }]}>
            <Ionicons name="search" size={18} color={colors.sub} />
            <TextInput style={{ flex: 1, minWidth: 0, color: colors.text, fontSize: 16, paddingVertical: 12 }} placeholder="Rechercher une recette ou un ingrédient"
              placeholderTextColor={colors.sub} value={q} onChangeText={setQ} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <Chip label="Toutes" active={!cat} onPress={() => setCat(null)} />
            {CATS.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(cat === c ? null : c)} />)}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 12 }}>
            {F('favoris', 'Favoris', 'star')}
            {F('proteines', 'Riche en protéines')}
            {F('leger', 'Léger')}
            {F('rapide', '≤ 15 min')}
            {F('budget', 'Petit budget')}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<Empty icon="search-outline" title="Aucune recette" sub="Change les filtres." />}
      renderItem={({ item: r }) => (
        <Pressable onPress={() => navigation.navigate('Recipe', { id: r.id, date, slot })}
          style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}>
          <View style={s.row}>
            <Text style={[s.h1, { flex: 1 }]} numberOfLines={2}>{r.name}</Text>
            {favs[r.id] ? <Ionicons name="star" size={16} color={colors.yellow} /> : null}
          </View>
          <Text style={s.sub}>{r.category} · {r.minutes} min{r.servings > 1 ? ` · ${r.servings} portions` : ''}{r.budget ? ' · €' : ''}</Text>
          <Text style={[s.sub, { marginTop: 6 }]}>
            <Text style={{ color: macroColors.kcal, fontWeight: '700' }}>{Math.round(r.m.kcal)} kcal</Text>
            {'  '}<Text style={{ color: macroColors.p }}>P {Math.round(r.m.p)} g</Text>
            {'  '}<Text style={{ color: macroColors.c }}>G {Math.round(r.m.c)} g</Text>
            {'  '}<Text style={{ color: macroColors.f }}>L {Math.round(r.m.f)} g</Text>
            <Text> / portion</Text>
          </Text>
        </Pressable>
      )}
    />
  );
}
