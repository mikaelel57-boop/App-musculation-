import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { useNetInfo } from '@react-native-community/netinfo';
import { useStore } from '../store/useStore';

const LOAD_TIMEOUT_MS = 6000;   // vidéo pas prête après 6 s -> image
const MAX_MB_CELLULAR = 8;      // au-delà en 4G/5G -> image
const MAX_MB_WIFI = 40;         // au-delà en Wi-Fi -> image

// Décision "vidéo ou image" avant même de charger quoi que ce soit
export function pickMode({ net, dataSaver, sizeMB, hasVideo }) {
  if (!hasVideo || dataSaver) return 'image';
  if (net.isConnected === false || net.isInternetReachable === false) return 'image';
  if (net.type === 'unknown' || net.isConnected == null) return 'image'; // réseau pas encore connu
  if (net.type === 'cellular') {
    const gen = net.details?.cellularGeneration;
    if (gen === '2g' || gen === '3g') return 'image';
    if (sizeMB && sizeMB > MAX_MB_CELLULAR) return 'image';
  } else if (sizeMB && sizeMB > MAX_MB_WIFI) {
    return 'image';
  }
  return 'video';
}

function VideoClip({ url, style, onFail }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'error') { onFail(); return; }
    if (status === 'readyToPlay') return;
    const t = setTimeout(onFail, LOAD_TIMEOUT_MS); // trop long à charger
    return () => clearTimeout(t);
  }, [status]);

  return (
    <View style={style}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      {status !== 'readyToPlay' && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}

/**
 * <AdaptiveMedia videoUrl imageUrl sizeMB style />
 * Affiche la vidéo si les conditions le permettent, sinon l'image/GIF.
 */
export default function AdaptiveMedia({ videoUrl, imageUrl, sizeMB, style }) {
  const net = useNetInfo();
  const dataSaver = useStore((st) => st.dataSaver);
  const [override, setOverride] = useState(null); // null | 'image' | 'video'

  const auto = pickMode({ net, dataSaver, sizeMB, hasVideo: !!videoUrl });
  const mode = override ?? auto;

  if (mode === 'video') {
    return <VideoClip url={videoUrl} style={style} onFail={() => setOverride('image')} />;
  }

  return (
    <View style={style}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
      {videoUrl && (
        <Pressable style={styles.loadBtn} onPress={() => setOverride('video')}>
          <Text style={styles.loadTxt}>▶ Charger la vidéo{sizeMB ? ` (${sizeMB} Mo)` : ''}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0006' },
  loadBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#000A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  loadTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
