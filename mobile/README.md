# Junto · app móvil

Expo SDK 58 · React Native · TypeScript · Expo Router · Supabase.

## Correr la app

1. Configura Supabase siguiendo [`../supabase/README.md`](../supabase/README.md) y crea `mobile/.env` a partir de `.env.example`.
2. Instala y arranca:

   ```bash
   cd mobile
   npm install
   npx expo start
   ```

3. Abre la app **Expo Go** (App Store / Google Play) y escanea el QR. El teléfono y el computador deben estar en la misma red Wi-Fi (o usa `npx expo start --tunnel`).

## Comandos

| Comando | Para qué |
|---|---|
| `npx expo start` | Servidor de desarrollo |
| `npx tsc --noEmit` | Revisar tipos |
| `npx expo lint` | Linter |
| `npx expo-doctor` | Revisar configuración y versiones |
| `npm run icons` | Regenerar `src/components/icons.generated.ts` tras añadir un icono en `scripts/build-icons.mjs` |
| `npx expo install <paquete>` | Instalar dependencias (siempre así, nunca `npm install <paquete>`) |

## Reglas

Ver [`../CLAUDE.md`](../CLAUDE.md) y [`AGENTS.md`](AGENTS.md):
- la app debe seguir funcionando en Expo Go;
- todo el diseño sale de `src/theme/tokens.ts`;
- los datos van siempre por `src/lib/api.ts`.
