import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { SLOTS, sumMacros, targets, latestWeight, today, addDays, longDate } from '../../utils/nutrition';
import MacroBars from '../../components/MacroBars';
import { Card, Ring, ListRow } from '../../components/ui';
import { s, colors } from '../../theme';

export default function NutritionScreen({ navigation }) {
  const [date, setDate] = useState(today());
  const meals = useStore((st) => st.meals[date]) || [];
  const profile = useStore((st) => st.profile);
  const daily = useStore((st) => st.daily);
  const t = targets(profile, latestWeight(daily, profile));
  const total = sumMacros(meals);
  const isToday = date === today();

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={[s.row, { marginBottom: 12 }]}>
        <Pressable onPress={() => setDate(addDays(date, -1))} hitSlop={10}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <Pressable onPress={() => setDate(today())}>
          <Text style={[s.h1, { textAlign: 'center' }]}>{isToday ? "Aujourd'hui" : longDate(date)}</Text>
        </Pressable>
        <Pressable onPress={() => !isToday && setDate(addDays(date, 1))} hitSlop={10} style={{ opacity: isToday ? 0.3 : 1 }}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring value={total.kcal} max={t.kcal} size={112}>
            <Text style={[s.h2, { fontSize: 22 }]}>{Math.round(total.kcal)}</Text>
            <Text style={[s.sub, { marginTop: 0, fontSize: 12 }]}>/ {t.kcal} kcal</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <MacroBars total={total} target={t} />
          </View>
        </View>
        <Text style={[s.sub, { marginTop: 10 }]}>
          {total.kcal < t.kcal ? `Encore ${Math.round(t.kcal - total.kcal)} kcal et ${Math.max(0, Math.round(t.p - total.p))} g de protéines` : 'Objectif calorique atteint ✓'}
        </Text>
      </Card>

      {SLOTS.map((slot) => {
        const items = meals.filter((m) => m.slot === slot.id);
        const k = Math.round(sumMacros(items).kcal);
        return (
          <Card key={slot.id}>
            <View style={s.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name={slot.icon} size={18} color={colors.accent} />
                <Text style={s.h1}>{slot.label}</Text>
              </View>
              <Text style={s.sub}>{k} kcal</Text>
            </View>
            {items.map((m) => (
              <View key={m.id} style={[s.row, { marginTop: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.text} numberOfLines={1}>{m.name}</Text>
                  <Text style={s.sub}>{m.qtyLabel} · {Math.round(m.kcal)} kcal · P {Math.round(m.p)} g</Text>
                </View>
                <Pressable onPress={() => useStore.getState().removeMeal(date, m.id)} hitSlop={10}>
                  <Ionicons name="close" size={20} color={colors.sub} />
                </Pressable>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <Pressable onPress={() => navigation.navigate('AddFood', { date, slot: slot.id })} hitSlop={6}>
                <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Aliment</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Recipes', { date, slot: slot.id })} hitSlop={6}>
                <Text style={{ color: colors.accent, fontWeight: '600' }}>+ Recette</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}

      <ListRow icon="book-outline" title="Toutes les recettes" sub="45 recettes muscu avec macros" onPress={() => navigation.navigate('Recipes')} />
      <ListRow icon="cart-outline" title="Liste de courses" sub="Générée à partir des recettes choisies" color={colors.orange}
        onPress={() => navigation.navigate('TabMore', { screen: 'Shopping', initial: false })} />
    </ScrollView>
  );
}
