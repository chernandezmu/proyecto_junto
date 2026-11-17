// Versión web de storage.ts: el navegador no tiene almacén cifrado, así que se usa
// localStorage. Riesgo aceptado para la versión web de prueba (SECURITY.md · Versión web).

function local(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura solo esta pestaña.
    return null;
  }
}

const memory = new Map<string, string>();

export const kv = {
  async get(key: string) {
    return local()?.getItem(key) ?? memory.get(key) ?? null;
  },
  async set(key: string, value: string) {
    try {
      local()?.setItem(key, value);
    } catch {
      // Cuota llena o bloqueado.
    }
    memory.set(key, value);
  },
  async remove(key: string) {
    local()?.removeItem(key);
    memory.delete(key);
  },
};
