import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL = 'rest-timer';

// Quand l'appli est ouverte, c'est l'écran Minuteur qui prévient (alerte + vibration) :
// on n'affiche donc pas la notification en plus.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let ready = null;
async function setup() {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Minuteur de repos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      sound: 'default',
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Programme une notification de fin de repos (fonctionne écran verrouillé / appli en fond).
export async function scheduleRestEnd(seconds) {
  try {
    ready = ready ?? setup();
    if (!(await ready)) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'Repos terminé 💪', body: "C'est reparti pour la prochaine série !", sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
        channelId: CHANNEL,
      },
    });
  } catch (e) {
    ready = null;
    return null;
  }
}

export async function cancelRestEnd(id) {
  if (!id) return;
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch (e) {}
}
