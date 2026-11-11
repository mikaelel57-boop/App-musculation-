import { Platform, Alert, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

// Boîte de confirmation (Alert ne fait rien sur le web)
export function confirmAction(title, message, okLabel, onOk) {
  if (isWeb) {
    if (window.confirm(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: okLabel, style: 'destructive', onPress: onOk },
  ]);
}

// --- Son (web) ---------------------------------------------------------------
// Safari n'autorise le son qu'après un geste de l'utilisateur : on "déverrouille"
// l'audio au moment où il appuie sur Lancer / + (appel synchrone dans le geste).
let ctx = null;
export function unlockAudio() {
  if (!isWeb) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    // Son silencieux très court : nécessaire sur iOS pour activer la sortie audio
    const o = ctx.createOscillator(); const g = ctx.createGain();
    g.gain.value = 0; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01);
  } catch (e) {}
}

function beep() {
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    [0, 0.35, 0.7].forEach((d) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.25);
      o.connect(g).connect(ctx.destination); o.start(t0 + d); o.stop(t0 + d + 0.3);
    });
  } catch (e) {}
}

// Signal de fin de repos (le bandeau visuel est affiché par RestWatcher)
export function restDoneFeedback() {
  if (isWeb) {
    beep();
    try { navigator.vibrate?.([500, 200, 500]); } catch (e) {}
    return;
  }
  Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
