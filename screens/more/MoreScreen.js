import React from 'react';
import { ScrollView, Text } from 'react-native';
import { ListRow } from '../../components/ui';
import { s, colors } from '../../theme';

export default function MoreScreen({ navigation }) {
  const go = (r) => () => navigation.navigate(r);
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <ListRow icon="person-outline" title="Mon profil et objectifs" sub="Calories, protéines, eau, pas, sommeil" onPress={go('Profile')} />
      <ListRow icon="body-outline" title="Suivi quotidien" sub="Poids, pas, sommeil, eau" color={colors.blue} onPress={go('Daily')} />
      <ListRow icon="cart-outline" title="Liste de courses" color={colors.orange} onPress={go('Shopping')} />
      <ListRow icon="timer-outline" title="Minuteur de repos" color={colors.cyan} onPress={go('Timer')} />
      <ListRow icon="cloud-download-outline" title="Sauvegarde de mes données" sub="Exporter / importer un fichier" color={colors.purple} onPress={go('Backup')} />
      <ListRow icon="information-circle-outline" title="Crédits et informations" color={colors.sub} onPress={go('Credits')} />
      <Text style={[s.sub, { textAlign: 'center', marginTop: 16 }]}>FitApp · version 2.0</Text>
    </ScrollView>
  );
}
