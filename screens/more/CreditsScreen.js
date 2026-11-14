import React from 'react';
import { ScrollView, Text, Linking } from 'react-native';
import { Card } from '../../components/ui';
import { s, colors } from '../../theme';

export default function CreditsScreen() {
  const link = (url) => <Text style={{ color: colors.accent }} onPress={() => Linking.openURL(url)}>{url.replace('https://', '')}</Text>;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Card>
        <Text style={s.h1}>Exercices et animations</Text>
        <Text style={[s.text, { marginTop: 6, lineHeight: 21 }]}>
          Les photos des exercices proviennent de free-exercise-db, une base placée dans le domaine public (Unlicense).
          Les animations ont été créées à partir de ces photos ; les textes ont été traduits et rédigés en français pour FitApp.
        </Text>
        <Text style={[s.sub, { marginTop: 6 }]}>{link('https://github.com/yuhonas/free-exercise-db')}</Text>
      </Card>
      <Card>
        <Text style={s.h1}>Valeurs nutritionnelles</Text>
        <Text style={[s.text, { marginTop: 6, lineHeight: 21 }]}>
          Valeurs moyennes pour 100 g, arrondies, établies d'après la table de composition nutritionnelle Ciqual (ANSES).
          Elles sont indicatives : les produits du commerce peuvent varier, vérifie l'étiquette si besoin.
        </Text>
        <Text style={[s.sub, { marginTop: 6 }]}>{link('https://ciqual.anses.fr')}</Text>
      </Card>
      <Card>
        <Text style={s.h1}>Calculs</Text>
        <Text style={[s.text, { marginTop: 6, lineHeight: 21 }]}>
          Besoins caloriques : formule de Mifflin-St Jeor. 1RM estimé : formule d'Epley (poids × (1 + reps / 30)).
          Ces calculs donnent des repères, pas un avis médical.
        </Text>
      </Card>
      <Card>
        <Text style={s.h1}>Tes données</Text>
        <Text style={[s.text, { marginTop: 6, lineHeight: 21 }]}>
          Tout reste sur ton téléphone : aucun compte, aucun serveur. Pense à faire une sauvegarde de temps en temps (menu Plus → Sauvegarde).
        </Text>
      </Card>
    </ScrollView>
  );
}
