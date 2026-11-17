import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { kv } from '@/lib/storage';

import { palettes, type Colors, type Scheme } from './tokens';

export type ThemePreference = 'dark' | 'light' | 'system';

type ThemeValue = {
  scheme: Scheme;
  colors: Colors;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const KEY = 'junto.theme';
const ThemeContext = createContext<ThemeValue | null>(null);

/** Oscuro por defecto (DESIGN.md). El usuario puede elegir Claro o Sistema en Ajustes. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>('dark');

  useEffect(() => {
    kv.get(KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light' || v === 'system') setPref(v);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme: Scheme = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
    return {
      scheme,
      colors: palettes[scheme],
      preference,
      setPreference: (p) => {
        setPref(p);
        kv.set(KEY, p).catch(() => {});
      },
    };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
