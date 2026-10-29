import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { time } from './format';

// Recordatorio de 1 h antes como notificación LOCAL: la programa el propio teléfono al
// inscribirse. Funciona en Expo Go (iPhone y Android) sin servidor de push.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'recordatorios';
const idFor = (planId: string) => `plan-${planId}`;

async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Recordatorios de planes',
      importance: AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Programa el aviso 1 h antes. Devuelve false si no hay permiso o ya es tarde. */
export async function scheduleReminder(plan: { id: string; title: string; startsAt: string; place: string }) {
  const at = new Date(new Date(plan.startsAt).getTime() - 60 * 60 * 1000);
  if (at.getTime() <= Date.now() + 60_000) return false;
  if (!(await ensurePermission())) return false;
  await cancelReminder(plan.id);
  await Notifications.scheduleNotificationAsync({
    identifier: idFor(plan.id),
    content: {
      title: `En 1 hora: ${plan.title}`,
      body: `${time(plan.startsAt)} · ${plan.place}`,
      data: { planId: plan.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
  });
  return true;
}

export async function cancelReminder(planId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(idFor(planId));
  } catch {
    // No había recordatorio programado.
  }
}

export async function hasReminder(planId: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.some((n) => n.identifier === idFor(planId));
}
