import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { mediaUrl } from '../utils/exercises';
import { colors } from '../theme';

// Animation (WebP animé) de l'exercice, ou vignette fixe
export default function ExerciseMedia({ ex, thumb = false, style }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[{ backgroundColor: '#fff', overflow: 'hidden' }, !thumb && { aspectRatio: 1.5 }, style]}>
      {!failed ? (
        <Image
          source={{ uri: mediaUrl(ex, thumb) }}
          style={StyleSheet.absoluteFill}
          contentFit={thumb ? 'cover' : 'contain'}
          transition={thumb ? 0 : 150}
          autoplay
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card2 }]}>
          <Ionicons name="barbell-outline" size={thumb ? 20 : 40} color={colors.sub} />
          {!thumb && <Text style={{ color: colors.sub, marginTop: 6 }}>Image indisponible hors ligne</Text>}
        </View>
      )}
    </View>
  );
}
