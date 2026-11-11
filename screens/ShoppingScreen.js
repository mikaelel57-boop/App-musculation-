import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import recipes from '../data/recipes.json';
import { fmtGrams } from '../utils/nutrition';
import { useStore } from '../store/useStore';
import { s, colors } from '../theme';

export default function ShoppingScreen() {
  const selected = useStore((st) => st.selected);
  const checked = useStore((st) => st.checked);
  const manual = useStore((st) => st.manual);
  const { toggleChecked, addManual, toggleManual, removeManual, resetChecked, clearShopping } = useStore.getState();
  const [txt, setTxt] = useState('');

  // Agrégation automatique des ingrédients des recettes sélectionnées
  const generated = useMemo(() => {
    const map = {};
    recipes.forEach((r) => {
      const n = selected[r.id];
      if (!n) return;
      r.ingredients.forEach((i) => { map[i.name] = (map[i.name] || 0) + i.grams * n; });
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, g]) => ({ id: 'a:' + name, name, label: fmtGrams(g), checked: !!checked['a:' + name], auto: true }));
  }, [selected, checked]);

  const data = [
    ...generated,
    ...manual.map((m) => ({ id: m.id, name: m.name, label: '', checked: m.checked, auto: false })),
  ];

  const add = () => {
    const name = txt.trim();
    if (!name) return;
    addManual(name);
    setTxt('');
  };

  const askClear = () =>
    Alert.alert('Nouvelle liste ?', 'Les recettes sélectionnées et les articles ajoutés seront retirés.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Vider', style: 'destructive', onPress: clearShopping },
    ]);

  return (
    <FlatList
      style={s.screen}
      data={data}
      keyExtractor={(i) => i.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[s.input, { flex: 1, minWidth: 0 }]}
            placeholder="Ajouter un article…"
            placeholderTextColor={colors.sub}
            value={txt}
            onChangeText={setTxt}
            onSubmitEditing={add}
          />
          <Pressable style={s.btn} onPress={add}><Text style={s.btnText}>+</Text></Pressable>
        </View>
        {data.length > 0 && (
          <View style={[s.row, { marginTop: 12 }]}>
            <Pressable onPress={resetChecked} hitSlop={8}><Text style={[s.sub, { color: colors.accent }]}>Tout décocher</Text></Pressable>
            <Pressable onPress={askClear} hitSlop={8}><Text style={[s.sub, { color: colors.danger }]}>Vider la liste</Text></Pressable>
          </View>
        )}
        </View>
      }
      ListEmptyComponent={<Text style={s.sub}>Sélectionne des recettes dans l'onglet Nutrition.</Text>}
      renderItem={({ item }) => (
        <View style={[s.card, s.row, { paddingVertical: 10 }]}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
            onPress={() => (item.auto ? toggleChecked(item.id) : toggleManual(item.id))}
          >
            <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={24} color={colors.accent} />
            <Text style={[s.text, item.checked && { textDecorationLine: 'line-through', color: colors.sub }]}>
              {item.name}
            </Text>
          </Pressable>
          {item.label ? <Text style={s.sub}>{item.label}</Text> : null}
          {!item.auto && (
            <Pressable onPress={() => removeManual(item.id)} style={{ marginLeft: 12 }}>
              <Ionicons name="close" size={22} color={colors.danger} />
            </Pressable>
          )}
        </View>
      )}
    />
  );
}
