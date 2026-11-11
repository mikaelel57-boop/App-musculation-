import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0F1115', card: '#1A1D24', text: '#F2F3F5', sub: '#9AA0AA',
  accent: '#4ADE80', danger: '#F87171', border: '#2A2E37',
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  h1: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sub: { color: colors.sub, fontSize: 13, marginTop: 2 },
  text: { color: colors.text, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  btnText: { color: '#08130C', fontWeight: '700', fontSize: 15 },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 16 },
});
