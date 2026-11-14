import React, { useState } from 'react';
import { ScrollView, Text, TextInput, Platform, Share } from 'react-native';
import { useStore } from '../../store/useStore';
import { today } from '../../utils/nutrition';
import { confirmAction } from '../../utils/feedback';
import { Card, Button } from '../../components/ui';
import { s, colors } from '../../theme';

const isWeb = Platform.OS === 'web';

export default function BackupScreen() {
  const [msg, setMsg] = useState('');
  const [paste, setPaste] = useState('');
  const logs = useStore((st) => st.logs.length);
  const days = useStore((st) => Object.keys(st.daily).length);
  const meals = useStore((st) => Object.values(st.meals).reduce((t, d) => t + d.length, 0));

  const exportFile = async () => {
    const json = JSON.stringify(useStore.getState().exportData());
    const name = `fitapp-sauvegarde-${today()}.json`;
    if (isWeb) {
      const blob = new Blob([json], { type: 'application/json' });
      const file = typeof File !== 'undefined' ? new File([blob], name, { type: 'application/json' }) : null;
      // Sur iPhone : feuille de partage (Enregistrer dans Fichiers, AirDrop, mail…)
      if (file && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Sauvegarde FitApp' }); setMsg('Sauvegarde partagée ✓'); return; } catch (e) { if (e?.name === 'AbortError') return; }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setMsg('Fichier téléchargé ✓');
    } else {
      await Share.share({ message: json, title: name });
    }
  };

  const doImport = (text) => {
    try {
      const data = JSON.parse(text);
      confirmAction('Restaurer cette sauvegarde ?', 'Tes données actuelles seront remplacées par celles du fichier.', 'Restaurer', () => {
        try { useStore.getState().importData(data); setMsg('Données restaurées ✓'); setPaste(''); } catch (e) { setMsg('Erreur : ' + e.message); }
      });
    } catch (e) {
      setMsg('Ce fichier n\'est pas une sauvegarde FitApp valide.');
    }
  };

  const importFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => { const f = input.files?.[0]; if (f) doImport(await f.text()); };
    input.click();
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={s.h1}>Pourquoi sauvegarder ?</Text>
        <Text style={[s.text, { marginTop: 6, lineHeight: 21 }]}>
          Tes données sont enregistrées uniquement sur ce téléphone. Si tu supprimes l'appli ou changes de téléphone, elles sont perdues.
          Exporte un fichier de temps en temps (dans Fichiers, iCloud Drive ou par mail).
        </Text>
        <Text style={[s.sub, { marginTop: 8 }]}>Actuellement : {logs} séries · {days} jours de suivi · {meals} repas</Text>
      </Card>
      <Button title="Exporter mes données" icon="share-outline" onPress={exportFile} />
      {isWeb ? (
        <Button title="Restaurer depuis un fichier" icon="folder-open-outline" variant="secondary" onPress={importFile} style={{ marginTop: 10 }} />
      ) : (
        <>
          <Text style={[s.sub, { marginTop: 16, marginBottom: 6 }]}>Pour restaurer, colle le contenu du fichier ici :</Text>
          <TextInput style={[s.input, { height: 100 }]} multiline value={paste} onChangeText={setPaste} placeholderTextColor={colors.sub} placeholder="{ ... }" />
          <Button title="Restaurer" variant="secondary" onPress={() => doImport(paste)} style={{ marginTop: 10 }} disabled={!paste} />
        </>
      )}
      {msg ? <Text style={[s.text, { color: colors.accent, textAlign: 'center', marginTop: 14 }]}>{msg}</Text> : null}
    </ScrollView>
  );
}
