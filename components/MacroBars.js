import React from 'react';
import { View, Text } from 'react-native';
import { Bar } from './ui';
import { s, macroColors } from '../theme';

// Barres protéines / glucides / lipides par rapport aux objectifs
export default function MacroBars({ total, target }) {
  const rows = [
    ['p', 'Protéines'],
    ['c', 'Glucides'],
    ['f', 'Lipides'],
  ];
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([k, l]) => (
        <View key={k}>
          <View style={[s.row, { marginBottom: 4 }]}>
            <Text style={[s.text, { fontSize: 14 }]}>{l}</Text>
            <Text style={[s.sub, { marginTop: 0 }]}>
              <Text style={{ color: macroColors[k], fontWeight: '700' }}>{Math.round(total[k])}</Text> / {target[k]} g
            </Text>
          </View>
          <Bar value={total[k]} max={target[k]} color={macroColors[k]} />
        </View>
      ))}
    </View>
  );
}
