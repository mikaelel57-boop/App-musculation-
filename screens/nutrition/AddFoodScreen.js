import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { foods, foodMacros, SLOTS, today, fr } from '../../utils/nutrition';
import { normalize } from '../../utils/exercises';
import { Card, Button, Chip } from '../../components/ui';
import { s, colors, macroColors } from '../../theme';

export default function AddFoodScreen({ navigation, route }) {
  const date = route.params?.date || today();
  const [slot, setSlot] = useState(route.params?.slot || 'midi');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [grams, setGrams] = useState('');

  const list = useMemo(() => {
    const n = normalize(q.trim());
    return n ? foods.filter((f) => normalize(f.name).includes(n)) : foods;
  }, [q]);

  const pick = (f) => { setSel(f); setGrams(String(f.portion?.g || 100)); };
  const g = parseFloat(String(grams).replace(',', '.')) || 0;
  const m = sel ? foodMacros(sel, g) : null;

  const add = () => {
    if (!sel || g <= 0) return;
    useStore.getState().addMeal(date, { slot, kind: 'food', ref: sel.id, qty: g, name: sel.name, qtyLabel: `${fr(g, 0)} g`, ...m });
    navigation.goBack();
  };

  if (sel) {
    return (
      <View style={[s.screen, s.content]}>
        <Pressable onPress={() => setSel(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <Ionicons name="chevron-back" size={18} color={colors.accent} />
          <Text style={{ color: colors.accent }}>Changer d'aliment</Text>
        </Pressable>
        <Text style={s.h2}>{sel.name}</Text>
        <Text style={s.sub}>Pour 100 g : {Math.round(sel.kcal)} kcal · P {fr(sel.p)} · G {fr(sel.c)} · L {fr(sel.f)}</Text>

        <Text style={[s.sub, { marginTop: 16, marginBottom: 6 }]}>Quantité (g)</Text>
        <TextInput style={[s.input, { fontSize: 22, fontWeight: '700' }]} keyboardType="decimal-pad" value={grams} onChangeText={setGrams} selectTextOnFocus autoFocus />
        {sel.portion ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {[1, 2, 3].map((k) => (
              <Chip key={k} label={`${k} × ${sel.portion.label.replace(/^1 /, '')} (${sel.portion.g * k} g)`} onPress={() => setGrams(String(sel.portion.g * k))} active={g === sel.portion.g * k} />
            ))}
          </View>
        ) : null}

        <Card style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
          {[['kcal', 'kcal'], ['p', 'Prot.'], ['c', 'Gluc.'], ['f', 'Lip.']].map(([k, l]) => (
            <View key={k} style={{ alignItems: 'center' }}>
              <Text style={[s.h1, { color: macroColors[k] }]}>{Math.round(m[k])}</Text>
              <Text style={s.sub}>{l}</Text>
            </View>
          ))}
        </Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SLOTS.map((sl) => <Chip key={sl.id} label={sl.label} active={slot === sl.id} onPress={() => setSlot(sl.id)} />)}
        </View>
        <Button title="Ajouter au journal" icon="add" onPress={add} disabled={g <= 0} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={list}
      keyExtractor={(f) => f.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={[s.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 0, marginBottom: 12 }]}>
          <Ionicons name="search" size={18} color={colors.sub} />
          <TextInput style={{ flex: 1, minWidth: 0, color: colors.text, fontSize: 16, paddingVertical: 12 }} placeholder="Rechercher un aliment"
            placeholderTextColor={colors.sub} value={q} onChangeText={setQ} autoCorrect={false} />
        </View>
      }
      renderItem={({ item: f }) => (
        <Pressable onPress={() => pick(f)} style={({ pressed }) => [s.card, s.row, { paddingVertical: 10 }, pressed && { opacity: 0.75 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.text}>{f.name}</Text>
            <Text style={s.sub}>{Math.round(f.kcal)} kcal · P {fr(f.p)} g / 100 g</Text>
          </View>
          <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
        </Pressable>
      )}
    />
  );
}
