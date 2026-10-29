import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

// Solo valores públicos: la URL del proyecto y la clave publicable (anon). Toda regla de
// acceso vive en la base de datos (RLS + RPC). Nunca pongas aquí una clave secreta.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = !!url && !!key;

/**
 * Sesión en el almacén cifrado del sistema (Keychain / Keystore). SecureStore limita el
 * tamaño de cada valor, así que la sesión se guarda partida en trozos.
 */
const CHUNK = 1800;
const secureStorage = {
  async getItem(k: string) {
    const count = await SecureStore.getItemAsync(`${k}.n`);
    if (!count) return null;
    const parts = await Promise.all(Array.from({ length: Number(count) }, (_, i) => SecureStore.getItemAsync(`${k}.${i}`)));
    return parts.some((p) => p == null) ? null : parts.join('');
  },
  async setItem(k: string, value: string) {
    const old = Number((await SecureStore.getItemAsync(`${k}.n`)) ?? 0);
    const parts = value.match(new RegExp(`.{1,${CHUNK}}`, 'gs')) ?? [''];
    await Promise.all(parts.map((p, i) => SecureStore.setItemAsync(`${k}.${i}`, p)));
    await SecureStore.setItemAsync(`${k}.n`, String(parts.length));
    for (let i = parts.length; i < old; i++) await SecureStore.deleteItemAsync(`${k}.${i}`);
  },
  async removeItem(k: string) {
    const n = Number((await SecureStore.getItemAsync(`${k}.n`)) ?? 0);
    for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${k}.${i}`);
    await SecureStore.deleteItemAsync(`${k}.n`);
  },
};

export const supabase = createClient(url ?? 'https://not-configured.invalid', key ?? 'not-configured', {
  auth: {
    storage: secureStorage,
    storageKey: 'junto.auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refrescar el token solo con la app en primer plano (recomendación de Expo y Supabase).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** URL pública de una foto del bucket "media" (rutas aleatorias bajo la carpeta del dueño). */
export function mediaUrl(path?: string | null) {
  if (!path) return null;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
