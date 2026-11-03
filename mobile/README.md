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

## Generar el APK para la demo (Android)

El APK se construye en la nube de Expo (EAS), sin Android Studio. Se hace una vez configurado Supabase.

1. Crea una cuenta gratis en [expo.dev](https://expo.dev). Desde `mobile/`, inicia sesión y vincula el proyecto; esto agrega el `projectId` a `app.json` y hay que guardar ese cambio en git:

   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```

2. Carga en EAS las dos variables **públicas** de Supabase para el perfil `preview`, las mismas de tu `.env`. El `.env` no se sube a la nube:

   ```bash
   npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co --environment preview --visibility plaintext
   npx eas-cli@latest env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_... --environment preview --visibility plaintext
   ```

   Nunca subas a EAS la clave secreta ni la contraseña de la base de datos.

3. Construye el APK:

   ```bash
   npx eas-cli@latest build -p android --profile preview
   ```

   Tarda unos 10–20 minutos. Al terminar, EAS da un enlace y un QR. Ábrelos en cada Android, descarga el APK e instálalo; el teléfono pedirá permitir "instalar apps de origen desconocido".

4. En iPhone no hay APK: se usa **Expo Go** con `npx expo start --tunnel` (sin cuenta de Apple Developer no hay TestFlight).

`eas.json` tiene dos perfiles:
- **`preview`:** APK interno para la demo.
- **`production`:** para las tiendas, después del 16 de noviembre.

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
