// Versión web de notifications.ts: el navegador no puede programar avisos locales como el
// teléfono, así que el recordatorio de 1 h antes no existe en la web.

export const remindersAvailable = false;

export async function scheduleReminder(_plan: { id: string; title: string; startsAt: string; place: string }) {
  return false;
}

export async function cancelReminder(_planId: string) {}

export async function hasReminder(_planId: string) {
  return false;
}
