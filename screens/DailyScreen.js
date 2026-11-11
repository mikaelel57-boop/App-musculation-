import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, AppState } from 'react-native';
import { useStore } from '../store/useStore';
import { today, fmtDate } from '../utils/nutrition';
import { s, colors } from '../theme';

const EMPTY = { weight: '', steps: '', sleep: '', water: '' };
const FIELDS = [
  ['weight', 'Poids', 'kg', 'ex. 80'],
  ['steps', 'Pas', '', 'ex. 8000'],
  ['sleep', 'Sommeil', 'h', 'ex. 7,5'],
  ['water', 'Eau', 'L', 'ex. 2'],
];

// Date du jour qui se met à jour (passage de minuit, retour au premier plan)
function useToday() {
  const [day, setDay] = useState(today());
  useEffect(() => {
    const refresh = () => setDay(today());
    const id = setInterval(refresh, 60 * 1000);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && refresh());
    return () => { clearInterval(id); sub.remove(); };
  }, []);
  return day;
}

const show = (v, unit) => (v === '' || v == null ? '—' : `${String(v).replace('.', ',')}${unit}`);

export default function DailyScreen() {
  const hydrated = useStore((st) => st.hydrated);
  const daily = useStore((st) => st.daily);
  const saveDaily = useStore((st) => st.saveDaily);
  const day = useToday();
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  // (Re)charge le formulaire quand les données sont prêtes ou que le jour change
  useEffect(() => {
    if (!hydrated) return;
    setForm({ ...EMPTY, ...(useStore.getState().daily[day] || {}) });
    setSaved(false);
  }, [hydrated, day]);

  const set = (k, v) => { setSaved(false); setForm((f) => ({ ...f, [k]: v })); };
  const isEmpty = Object.values(form).every((v) => String(v).trim() === '');
  const history = Object.keys(daily).sort().reverse().slice(0, 7);

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Aujourd'hui · {fmtDate(day)}</Text>

      {FIELDS.map(([k, label, unit, ph]) => (
        <View key={k} style={{ marginTop: 12 }}>
          <Text style={s.sub}>{unit ? `${label} (${unit})` : label}</Text>
          <TextInput
            style={s.input}
            keyboardType="decimal-pad"
            placeholder={ph}
            placeholderTextColor={colors.sub}
            value={String(form[k] ?? '')}
            onChangeText={(v) => set(k, v.replace(',', '.'))}
          />
        </View>
      ))}

      <Pressable style={[s.card, { marginTop: 12, alignItems: 'center' }]}
        onPress={() => set('water', String(+((parseFloat(form.water) || 0) + 0.25).toFixed(2)))}>
        <Text style={s.text}>+ 0,25 L d'eau</Text>
      </Pressable>

      <Pressable style={[s.btn, isEmpty && { opacity: 0.4 }]} disabled={isEmpty}
        onPress={() => { saveDaily(day, form); setSaved(true); }}>
        <Text style={s.btnText}>{saved ? 'Enregistré ✓' : 'Enregistrer'}</Text>
      </Pressable>

      <Text style={[s.h1, { marginTop: 24, marginBottom: 8 }]}>7 derniers jours</Text>
      {history.length === 0 && <Text style={s.sub}>Aucune donnée pour l'instant.</Text>}
      {history.map((d) => (
        <View key={d} style={s.card}>
          <Text style={s.text}>{fmtDate(d)}</Text>
          <Text style={s.sub}>
            {show(daily[d].weight, ' kg')} · {show(daily[d].steps, ' pas')} · {show(daily[d].sleep, ' h')} · {show(daily[d].water, ' L')}
          </Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
