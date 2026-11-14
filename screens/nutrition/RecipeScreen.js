import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { recipesById, foodsById, recipeMacros, SLOTS, today, fmtGrams, fr } from '../../utils/nutrition';
import { Card, Button, Chip, Stepper, SectionTitle } from '../../components/ui';
import { s, colors, macroColors } from '../../theme';

const defaultSlot = () => {
  const h = new Date().getHours();
  return h < 11 ? 'matin' : h < 15 ? 'midi' : h < 18 ? 'collation' : 'soir';
};

export default function RecipeScreen({ navigation, route }) {
  const r = recipesById[route.params?.id];
  const fav = useStore((st) => !!st.favorites.recipes[r?.id]);
  const inCart = useStore((st) => st.selected[r?.id] || 0);
  const [portions, setPortions] = useState(1);
  const [slot, setSlot] = useState(route.params?.slot || defaultSlot());
  const [added, setAdded] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: r?.name || 'Recette',
      headerRight: () => (
        <Pressable onPress={() => useStore.getState().toggleFav('recipes', r.id)} hitSlop={10}>
          <Ionicons name={fav ? 'star' : 'star-outline'} size={22} color={fav ? colors.yellow : colors.sub} />
        </Pressable>
      ),
    });
  }, [navigation, r, fav]);

  if (!r) return null;
  const m = recipeMacros(r);
  const date = route.params?.date || today();

  const eat = () => {
    useStore.getState().addMeal(date, {
      slot, kind: 'recipe', ref: r.id, qty: portions, name: r.name,
      qtyLabel: `${fr(portions)} portion${portions > 1 ? 's' : ''}`,
      kcal: m.kcal * portions, p: m.p * portions, c: m.c * portions, f: m.f * portions,
    });
    setAdded(true);
    if (route.params?.slot) navigation.popTo('Nutrition');
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h2}>{r.name}</Text>
      <Text style={s.sub}>{r.category} · {r.minutes} min · {r.servings} portion{r.servings > 1 ? 's' : ''}{r.budget ? ' · petit budget' : ''}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        {[['kcal', 'kcal', ''], ['p', 'Protéines', ' g'], ['c', 'Glucides', ' g'], ['f', 'Lipides', ' g']].map(([k, l, u]) => (
          <Card key={k} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 4 }}>
            <Text style={[s.h1, { color: macroColors[k] }]}>{Math.round(m[k])}{u}</Text>
            <Text style={[s.sub, { fontSize: 11 }]}>{l}</Text>
          </Card>
        ))}
      </View>
      <Text style={[s.sub, { marginTop: -4 }]}>Valeurs pour 1 portion</Text>

      <Card style={{ marginTop: 14 }}>
        <Text style={s.h1}>J'ai mangé ça</Text>
        <View style={[s.row, { marginTop: 10 }]}>
          <Text style={s.text}>Portions</Text>
          <Stepper value={portions} step={0.5} min={0.5} onChange={setPortions} format={(v) => fr(v)} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {SLOTS.map((sl) => <Chip key={sl.id} label={sl.label} active={slot === sl.id} onPress={() => setSlot(sl.id)} />)}
        </View>
        <Button title={added ? 'Ajouté au journal ✓' : `Ajouter · ${Math.round(m.kcal * portions)} kcal`} icon="add" onPress={eat} style={{ marginTop: 12 }} />
      </Card>

      <SectionTitle title={`Ingrédients (${r.servings} portion${r.servings > 1 ? 's' : ''})`} />
      <Card>
        {r.ingredients.map((i) => (
          <View key={i.food} style={[s.row, { paddingVertical: 5 }]}>
            <Text style={[s.text, { flex: 1 }]}>{foodsById[i.food].name}</Text>
            <Text style={s.sub}>{fmtGrams(i.g)}</Text>
          </View>
        ))}
      </Card>
      <View style={[s.row, { marginBottom: 12 }]}>
        <Text style={s.text}>Dans ma liste de courses</Text>
        <Stepper value={inCart} min={0} onChange={(v) => useStore.getState().setPortions(r.id, v)} format={(v) => `×${v}`} width={40} />
      </View>

      <SectionTitle title="Préparation" />
      <Card>
        {r.steps.map((st, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: i < r.steps.length - 1 ? 12 : 0 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#08130C', fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
            </View>
            <Text style={[s.text, { flex: 1, lineHeight: 21 }]}>{st}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
