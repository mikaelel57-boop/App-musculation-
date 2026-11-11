import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, Pressable } from 'react-native';
import recipes from '../data/recipes.json';
import { recipeMacros, fr } from '../utils/nutrition';
import { useStore } from '../store/useStore';
import { s } from '../theme';

function RecipeCard({ r }) {
  const [open, setOpen] = useState(false);
  const qty = useStore((st) => st.selected[r.id] || 0);
  const setPortions = useStore((st) => st.setPortions);
  const m = useMemo(() => recipeMacros(r), [r]);

  return (
    <View style={s.card}>
      <Pressable onPress={() => setOpen(!open)}>
        <Text style={s.h1}>{r.name}</Text>
        <Text style={s.sub}>
          {Math.round(m.kcal)} kcal · P {fr(m.p)} g · G {fr(m.c)} g · L {fr(m.f)} g
        </Text>
      </Pressable>

      {open &&
        r.ingredients.map((i) => (
          <View key={i.name} style={[s.row, { marginTop: 6 }]}>
            <Text style={s.text}>{i.name}</Text>
            <Text style={s.sub}>{i.grams} g</Text>
          </View>
        ))}

      <View style={[s.row, { marginTop: 12 }]}>
        <Text style={s.sub}>Courses : ×{qty}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={[s.btn, { paddingVertical: 6 }]} onPress={() => setPortions(r.id, qty - 1)}>
            <Text style={s.btnText}>−</Text>
          </Pressable>
          <Pressable style={[s.btn, { paddingVertical: 6 }]} onPress={() => setPortions(r.id, qty + 1)}>
            <Text style={s.btnText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  return (
    <FlatList
      style={s.screen}
      data={recipes}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <RecipeCard r={item} />}
    />
  );
}
