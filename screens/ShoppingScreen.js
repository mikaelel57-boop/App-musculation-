import React, { useMemo, useState } from 'react';
import { SectionList, View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { recipes, foodsById, fmtGrams } from '../utils/nutrition';
import { confirmAction } from '../utils/feedback';
import { Empty, Stepper } from '../components/ui';
import { s, colors } from '../theme';

const AISLE_ORDER = ['Viandes & poissons', 'Œufs & produits laitiers', 'Fruits', 'Légumes', 'Féculents & céréales',
  'Légumineuses & tofu', 'Huiles & oléagineux', 'Épicerie & sauces', 'Compléments & boissons'];

export default function ShoppingScreen({ navigation }) {
  const selected = useStore((st) => st.selected);
  const checked = useStore((st) => st.checked);
  const manual = useStore((st) => st.manual);
  const { toggleChecked, addManual, toggleManual, removeManual, resetChecked, clearShopping, setPortions } = useStore.getState();
  const [txt, setTxt] = useState('');

  // Agrégation des ingrédients des recettes sélectionnées, rangés par rayon
  const sections = useMemo(() => {
    const map = {};
    recipes.forEach((r) => {
      const n = selected[r.id];
      if (!n) return;
      r.ingredients.forEach((i) => { map[i.food] = (map[i.food] || 0) + (i.g * n) / r.servings; });
    });
    const byAisle = {};
    Object.entries(map).forEach(([fid, g]) => {
      const f = foodsById[fid];
      (byAisle[f.aisle] = byAisle[f.aisle] || []).push({ id: 'f:' + fid, name: f.name, label: fmtGrams(g), checked: !!checked['f:' + fid], auto: true });
    });
    const out = AISLE_ORDER.filter((a) => byAisle[a]).map((a) => ({ title: a, data: byAisle[a].sort((x, y) => x.name.localeCompare(y.name)) }));
    if (manual.length) out.push({ title: 'Ajouté à la main', data: manual.map((m) => ({ ...m, label: '', auto: false })) });
    return out;
  }, [selected, checked, manual]);

  const chosen = recipes.filter((r) => selected[r.id]);
  const add = () => { const name = txt.trim(); if (!name) return; addManual(name); setTxt(''); };

  return (
    <SectionList
      style={s.screen}
      contentContainerStyle={s.content}
      sections={sections}
      keyExtractor={(i) => i.id}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Ajouter un article…" placeholderTextColor={colors.sub}
              value={txt} onChangeText={setTxt} onSubmitEditing={add} />
            <Pressable style={s.btn} onPress={add}><Ionicons name="add" size={20} color="#08130C" /></Pressable>
          </View>

          {chosen.length ? (
            <View style={[s.card, { marginTop: 12 }]}>
              <Text style={[s.h1, { fontSize: 15, marginBottom: 6 }]}>Recettes choisies</Text>
              {chosen.map((r) => (
                <View key={r.id} style={[s.row, { paddingVertical: 4 }]}>
                  <Text style={[s.text, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{r.name}</Text>
                  <Stepper value={selected[r.id]} min={0} onChange={(v) => setPortions(r.id, v)} format={(v) => `${v} p.`} width={36} />
                </View>
              ))}
            </View>
          ) : null}

          {sections.length ? (
            <View style={[s.row, { marginTop: 12 }]}>
              <Pressable onPress={resetChecked} hitSlop={8}><Text style={{ color: colors.accent }}>Tout décocher</Text></Pressable>
              <Pressable hitSlop={8} onPress={() => confirmAction('Nouvelle liste ?', 'Les recettes choisies et les articles ajoutés seront retirés.', 'Vider', clearShopping)}>
                <Text style={{ color: colors.danger }}>Vider la liste</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View>
          <Empty icon="cart-outline" title="Ta liste est vide" sub="Ouvre une recette et choisis le nombre de portions à acheter." />
          <Pressable onPress={() => navigation.navigate('TabNutrition', { screen: 'Recipes', initial: false })} style={{ alignSelf: 'center' }}>
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Voir les recettes</Text>
          </Pressable>
        </View>
      }
      renderSectionHeader={({ section }) => <Text style={[s.sub, { color: colors.accent, fontWeight: '700', marginTop: 10, marginBottom: 6 }]}>{section.title.toUpperCase()}</Text>}
      renderItem={({ item }) => (
        <View style={[s.card, s.row, { paddingVertical: 10, marginBottom: 8 }]}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            onPress={() => (item.auto ? toggleChecked(item.id) : toggleManual(item.id))}>
            <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={24} color={colors.accent} />
            <Text style={[s.text, { flex: 1 }, item.checked && { textDecorationLine: 'line-through', color: colors.sub }]}>{item.name}</Text>
          </Pressable>
          {item.label ? <Text style={s.sub}>{item.label}</Text> : null}
          {!item.auto && (
            <Pressable onPress={() => removeManual(item.id)} style={{ marginLeft: 12 }} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.danger} />
            </Pressable>
          )}
        </View>
      )}
    />
  );
}
