import * as SecureStore from 'expo-secure-store';

/**
 * Almacén clave-valor del dispositivo. En el teléfono es el almacén cifrado del sistema
 * (Keychain / Keystore). En la web lo reemplaza storage.web.ts (localStorage).
 */
export const kv = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
