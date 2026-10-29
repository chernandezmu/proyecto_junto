import { Banner, Screen, Text } from '@/components/ui';

/** Se muestra si faltan las variables de Supabase (.env). Solo pasa en desarrollo. */
export function NotConfigured() {
  return (
    <Screen center>
      <Text variant="h1">Falta conectar Supabase</Text>
      <Text tone="muted">
        Crea el archivo mobile/.env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (mira .env.example) y vuelve a abrir la app.
      </Text>
      <Banner icon="info" fill="sky" title="Solo valores públicos" body="Nunca pongas la clave secreta ni la contraseña de la base de datos en la app." />
    </Screen>
  );
}
