# Junto · instrucciones para el agente

App móvil que conecta a estudiantes verificados de la Universidad El Bosque alrededor de planes del campus (swipe sobre planes, nunca sobre personas). Proyecto de la clase de Lenguajes Digitales (Start-ups). **Entrega: demo funcional en celulares el 2026-11-16.** El equipo escribe en español: responde en español.

## Antes de hacer nada

1. Lee `ROADMAP.md` (sobre todo `## Relevo`): dice la etapa actual y el siguiente paso concreto.
2. Se trabaja con la skill **ux-ui-and-code-skill** (`/ux-ui-and-code-skill`), etapa por etapa con aprobación del usuario al final de cada una.
3. Fuentes de verdad: `PROJECT-BRIEF.md` (decisiones), `DESIGN.md` + `design/pages/mvp.md` (diseño y pantallas), `SECURITY.md` (modelo de amenazas), `docs/` (documentación de producto del equipo; no editarla sin permiso).
4. Commit y push solo cuando el usuario lo pida.

## Estructura

```
mobile/      App Expo (SDK 58, React Native 0.88, React 19, TypeScript, Expo Router)
  src/app/         rutas (Expo Router). Stack raíz con Stack.Protected: (auth) · onboarding · (tabs) + interiores
  src/components/  ui/ (sistema de diseño), icons.generated.ts (no editar: npm run icons)
  src/lib/         supabase.ts, api.ts (RPC + zod), auth.tsx, errors.ts, format.ts, media.ts, notifications.ts
  src/theme/       tokens.ts (DESIGN.md en código), theme.tsx (oscuro por defecto)
supabase/
  migrations/      esquema + RLS + RPC (el servidor decide)
  tests/           pruebas de seguridad del esquema sobre PGlite (npm test → 92 ok)
design/      export de Claude Design, preview.html, pages/mvp.md
docs/        documentación de producto (del equipo)
```

## Reglas del código

- **Expo cambia en cada SDK**: lee `mobile/AGENTS.md`. Antes de usar una API de Expo/RN, consulta https://docs.expo.dev/llms.txt y la versión v58. Instala con `npx expo install`.
- **Debe seguir funcionando en Expo Go** (en iPhone no hay cuenta de Apple Developer): solo módulos incluidos en Expo Go (react-native-svg, reanimated, gesture-handler, safe-area, datetimepicker, netinfo, maps…). Nada que requiera build de desarrollo.
- Pestañas: `Tabs` de `expo-router/js-tabs` con `tabBar` propio (barra de 5: Inicio · Eventos · Wheels · Tours · Mis planes) y burbuja "+" flotando sobre Mis planes (DESIGN.md · create-fab).
- Colores, tipografía, radios, sombras y movimiento **solo** desde `src/theme/tokens.ts` vía `useTheme()`. Sin hex sueltos. Sombras duras con `style.boxShadow` (helper `hardShadow`).
- Componentes de `src/components/ui` (Button, Card, Field, Chip, Tag, Segmented, ToggleRow, Stars, Stepper, Sheet, StateBlock, Screen, Header, RootHeader…). `Screen` ya aplica zonas seguras y entrada escalonada.
- Iconos: `<Icon name="…" />`. Para añadir uno, agrégalo en `mobile/scripts/build-icons.mjs` y ejecuta `npm run icons` (alias: push_pin→keep, expand_more→keyboard_arrow_down).
- React 19: `ref` es prop; usa `ComponentRef<typeof TextInput>`.
- Datos: siempre por `api.*` (RPC validadas con zod). Las tablas están cerradas por RLS: no hagas `select` directo salvo el perfil propio.
- Errores al usuario con `friendlyError()` (causa + solución). Estados vacío/carga/error en cada pantalla (`design/pages/mvp.md` §4).
- Accesibilidad: labels en botones de icono, áreas ≥ 44/48, swipe con botones equivalentes, `useReducedMotion`.
- Antes de dar algo por terminado: `cd mobile && npx tsc --noEmit && npx expo lint`, y si tocaste SQL: `cd supabase/tests && npm test`.

## Decisiones técnicas ya tomadas

- Login sin contraseña: código de 6 dígitos al correo `@unbosque.edu.co` (Supabase OTP). El dominio se valida también en el servidor (trigger en `auth.users`).
- Recordatorio 1 h antes = notificación **local** programada en el teléfono (funciona en Expo Go). Sin push remoto en el MVP.
- Sin mapa embebido (Google Maps exige clave en el APK): lugar en texto + "Abrir en Maps".
- Sesión en `expo-secure-store` (troceada), no en almacenamiento plano.
- Fotos de perfil y de planes en bucket público `media` con rutas aleatorias; carnés en bucket privado `verifications`.
