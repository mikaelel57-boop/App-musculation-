import React from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, colors } from '../theme';

const parse = (v) => parseFloat(String(v).replace(',', '.')) || 0;
const show = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

// Champ numérique avec boutons − / +
export default function NumInput({ label, value, onChange, step = 1, min = 0, decimal = true, suffix }) {
  const bump = (d) => onChange(show(Math.max(min, parse(value) + d)));
  return (
    <View style={{ flex: 1 }}>
      {label ? <Text style={[s.sub, { marginBottom: 6, textAlign: 'center' }]}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card2, borderRadius: 14, padding: 4 }}>
        <Pressable onPress={() => bump(-step)} hitSlop={6} style={btn}>
          <Ionicons name="remove" size={22} color={colors.text} />
        </Pressable>
        <TextInput
          value={String(value)}
          onChangeText={(t) => onChange(t.replace(/[^0-9.,]/g, ''))}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          placeholder="0"
          placeholderTextColor={colors.sub}
          selectTextOnFocus
          style={{ flex: 1, minWidth: 0, color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', paddingVertical: 8 }}
        />
        {suffix ? <Text style={{ color: colors.sub, marginRight: 4 }}>{suffix}</Text> : null}
        <Pressable onPress={() => bump(step)} hitSlop={6} style={btn}>
          <Ionicons name="add" size={22} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}
const btn = { width: 44, height: 44, borderRadius: 11, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' };
export { parse as parseNum };
