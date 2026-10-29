// Fechas y horas en español de Colombia, siempre en la hora de Bogotá.
const TZ = 'America/Bogota';

const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });

export function time(d: Date | string) {
  return new Date(d).toLocaleTimeString('es-CO', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?a\.\s?m\./i, ' am').replace(/\s?p\.\s?m\./i, ' pm');
}

/** "Hoy", "Mañana", "Sáb 14" */
export function day(d: Date | string) {
  const date = new Date(d);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86_400_000);
  if (dayKey(date) === dayKey(now)) return 'Hoy';
  if (dayKey(date) === dayKey(tomorrow)) return 'Mañana';
  const wd = date.toLocaleDateString('es-CO', { timeZone: TZ, weekday: 'short' }).replace('.', '');
  const n = date.toLocaleDateString('es-CO', { timeZone: TZ, day: 'numeric' });
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${n}`;
}

/** "Hoy · 6:00 pm" */
export const when = (d: Date | string) => `${day(d)} · ${time(d)}`;

export const isToday = (d: Date | string) => dayKey(new Date(d)) === dayKey(new Date());

/** Fecha límite de cancelación gratis. */
export function cancelBy(startsAt: string, hours: number) {
  return new Date(new Date(startsAt).getTime() - hours * 3_600_000);
}

/** "1 h 15 min", "40 min" */
export function remaining(to: Date, now: number) {
  const mins = Math.max(0, Math.round((to.getTime() - now) / 60_000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h} h ${mins % 60} min` : `${mins} min`;
}

export function seatsLabel(capacity: number, joined: number) {
  const left = capacity - joined;
  return left <= 0 ? 'Lleno' : `${left} ${left === 1 ? 'cupo' : 'cupos'}`;
}

export function birthDate(d: Date) {
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function isAdult(d: Date) {
  const now = new Date();
  const limit = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return d <= limit;
}

/** YYYY-MM-DD para la base de datos. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
