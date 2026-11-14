import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#0F1115', card: '#1A1D24', card2: '#22262F', text: '#F2F3F5', sub: '#9AA0AA',
  accent: '#4ADE80', accentDim: '#4ADE8022', danger: '#F87171', border: '#2A2E37',
  blue: '#60A5FA', orange: '#FB923C', yellow: '#FACC15', purple: '#C084FC', cyan: '#22D3EE',
};
// Couleurs des macros (identiques partout)
export const macroColors = { kcal: colors.accent, p: colors.blue, c: colors.orange, f: colors.yellow };

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 120 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  h1: { color: colors.text, fontSize: 17, fontWeight: '700' },
  h2: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sub: { color: colors.sub, fontSize: 13, marginTop: 2 },
  text: { color: colors.text, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#08130C', fontWeight: '700', fontSize: 15 },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 16, minWidth: 0 },
});
