import { useEffect, useState } from 'react';

/** Hora actual que se actualiza sola (cuentas regresivas, "empieza en…"). Pura para el render. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
