# ROADMAP · Junto

> Estado del proyecto por etapas (ux-ui-and-code-skill). Al retomar una sesión, el agente lee este archivo primero y continúa en la **etapa actual**.

## 📍 Dónde vamos (actualizado 2026-10-29)

| Etapa | Estado |
|---|---|
| E0 · Planificación | ✅ Terminada |
| E1 · Diseño | ✅ Aprobada (barra de 5 pestañas + burbuja "+" sobre Mis planes) |
| **E2 · Código** | **⏳ En curso: código del MVP completo y compilando; falta conectar Supabase y probar en teléfonos** |
| E3 · Automatizaciones | ⬜ Pendiente |
| E4 · Seguridad | ⬜ Pendiente |
| E5 · Pulido | ⬜ Pendiente |

**Para retomar en un chat nuevo:** abrir la carpeta `app-junto` en VS Code, iniciar una sesión de Claude Code y decir *"sigamos con el proyecto"*. El agente lee `CLAUDE.md` y la sección **Relevo** de este archivo.

**Próximo paso:**
1. El usuario crea y configura el proyecto de Supabase siguiendo `supabase/README.md`.
2. Después se prueba el flujo completo en Expo Go con 2–3 cuentas reales.

**Entrega:** demo en celulares el 2026-11-16.

**Etapa actual:** E2 · Código (todas las pantallas escritas; falta conectar Supabase y probar en dispositivo)
**Modo de avance:** Etapa por etapa con aprobación
**Lienzo de diseño:** Claude Design (proyecto "Junto App"; copia de referencia en `design/claude-design/`)
**Vía de código:** Desde Claude Design (el HTML exportado es referencia; se reescribe en React Native con tokens)
**Fecha objetivo:** 2026-11-16 (18 días desde el 2026-10-29). Es la entrega de la clase de Lenguajes Digitales (Start-ups); no hay fecha de lanzamiento público.

## Prioridades

| P | Funcionalidad | Notas |
|---|---|---|
| P0 | Registro verificado: correo `@unbosque.edu.co` con OTP → carné → perfil e intereses | Revisión del carné en < 24 h; el usuario ve el estado "en revisión" |
| P0 | Login con código al correo | Sin contraseña |
| P0 | Inicio: saludo, universidad verificada, próximo plan, accesos de módulo, botón Crear | Wheels y Tours como "Próximamente" |
| P0 | Barra inferior de 5 pestañas; pestañas Wheels y Tours con pantalla "Próximamente" | Decisión del usuario en E1 |
| P0 | Feed con swipe (solo planes del propio campus), filtros | Swipe sobre planes, nunca personas |
| P0 | Detalle del plan: organizador verificado, "Quién va", etiquetas, reportar, guardar, compartir | |
| P0 | Inscripción con confirmación, plan lleno + "Avisarme", "¡Estás dentro!" | Aviso de efecto en la calificación antes de confirmar |
| P0 | Chat del plan (Realtime) con mensaje fijado | Solo miembros |
| P0 | Día del plan: punto de encuentro ("Abrir en Maps"), código de asistencia, "Ya llegué", "Voy tarde" | Sin mapa embebido (clave de Google Maps en el APK) |
| P0 | Calificación del plan y de los asistentes (doble ciego) | |
| P0 | Cancelar dentro y fuera del plazo, cancelación confirmada | |
| P0 | Crear plan, quién puede unirse, plan publicado, solicitudes, validar asistencia | |
| P0 | Mis planes, Perfil, Ajustes (tema, notificaciones), Privacidad y seguridad | Bloquear, reportar, eliminar cuenta, descargar datos |
| P0 | Recordatorio 1 h antes del plan | Notificación **local** programada en el teléfono al inscribirse: funciona en Expo Go (iPhone y Android), sin servidor de push |
| P0 | Emails: plantilla de código OTP de Supabase con el texto de Junto | Sin proveedor propio para el 16 |
| P0 | Revisión de carnés desde el panel de Supabase (Table Editor + Storage) | La revisa el equipo; cambiar `verification_status` a mano |
| P0 | Legal mínimo: normas de la comunidad, aviso de privacidad y autorización de datos en el registro, regla 18+ | ❓ el texto completo de la política queda para después |
| P1 | Notificaciones push restantes: chat, solicitud aceptada, cupo liberado, carné aprobado | Después del 16 |
| P1 | Emails transaccionales con marca (proveedor propio) | Después del 16 |
| P1 | Panel web interno de carnés y reportes (rol `reviewer`, 2FA) | Después del 16 |
| P1 | Auditoría de seguridad completa (6 fases) | Después del 16; antes es revisión guiada |
| P1 | Publicación en App Store y Google Play | Cuentas de desarrollador + 14 días de prueba cerrada en Google |
| P1 | Ritual semanal por campus, racha de semanas, participación visible en el perfil | Fase 2 |
| P1 | Inglés | |
| P2 | Wheels completo con pagos | Fase 3 · requiere densidad de campus |
| P2 | Tours y segundo campus | Fase 4 |

## Entrega del 16 de noviembre

**"Listo" significa:** demo funcional en celulares, con datos reales en Supabase:
- APK de Android instalado en los teléfonos del equipo y de la profesora;
- en iPhone, Expo Go (sin push) o TestFlight si hay cuenta de Apple.

No se publica en las tiendas.

| Fechas | Etapa | Qué queda hecho |
|---|---|---|
| 30 oct – 1 nov | E1 · Diseño | `DESIGN.md` aprobado (tokens, tipografía, componentes) |
| 2 – 3 nov | E2 · Código | Proyecto Expo, tema, fuentes, navegación; Supabase con esquema y RLS |
| 4 – 5 nov | E2 · Código | Registro (OTP, carné, perfil, 18+), login, Inicio |
| 6 – 8 nov | E2 · Código | Feed con swipe, detalle, confirmar, plan lleno, estás dentro, cancelar |
| 9 – 10 nov | E2 · Código | Chat del plan, día del plan con código, calificación |
| 11 – 12 nov | E2 · Código | Crear plan, solicitudes, Mis planes, Perfil, Ajustes, Privacidad; push del recordatorio |
| desde 3 nov | E3 · Automatizaciones | CI en GitHub y builds de EAS en paralelo al código |
| 13 – 14 nov | E4 · Seguridad | Checklist + revisión guiada (aislamiento entre campus, chat, carnés, asistencia) |
| 15 nov | E5 · Pulido | Accesibilidad, copy, datos de demo, APK final |
| 16 nov | Entrega | Demo en clase |

Margen: casi ninguno. Si E2 se retrasa, lo primero que se recorta es la calificación de cada asistente (queda solo la del plan) y luego los filtros del feed.

## Etapas

Leyenda: ✅ hecho · ⏳ en curso · ⬜ pendiente · ➖ omitido · ❓ needs_validation

### E0 · Planificación — ✅
- ✅ PROJECT-BRIEF.md
- ✅ SECURITY.md (modelo de amenazas)
- ✅ Prioridades y profundidad acordadas

### E1 · Diseño — ✅ aprobado (2026-10-29) · Profundidad: Estándar
- ✅ Identidad: tokens semánticos sacados de Claude Design (colores, radios, sombras duras, motion), en claro y oscuro → `DESIGN.md`
- ✅ Contraste corregido en claro: `destructive-text` #b3261e, estrella #b8651c, estrella vacía en contorno; lima y coral solo como relleno
- ✅ Escala tipográfica con cuerpo 16 y mínimos 14 / 12
- ✅ Reglas nativas: áreas táctiles, zonas seguras, swipe con botones y acciones accesibles, Dynamic Type, movimiento reducido
- ✅ Inventario de componentes en el frontmatter de `DESIGN.md`
- ✅ Pantallas del MVP mapeadas a rutas, con cambios respecto a Claude Design → `design/pages/mvp.md`
- ✅ Pantallas nuevas y estados (login con código, autorización de datos, 18+, carné en revisión o rechazado, feed vacío, validar asistencia, reportar, sin conexión, errores) → `design/pages/mvp.md` + `design/preview.html`
- ✅ Aprobación del usuario (con 2 cambios: barra de 5 pestañas y burbuja "+" sobre Mis planes)
- **Salida:** el usuario aprueba `DESIGN.md` y el look de las pantallas clave

### E2 · Código — ⏳ · Profundidad: Completo
- ✅ Scaffold Expo SDK 58 + TypeScript + Expo Router en `mobile/`; dependencias instaladas con `npx expo install`
- ✅ Tema desde `DESIGN.md` (`src/theme/tokens.ts`, `theme.tsx`: oscuro por defecto, claro y sistema); fuentes Lexend + Bricolage Grotesque
- ✅ Iconos: `scripts/build-icons.mjs` → `src/components/icons.generated.ts` (95 Material Symbols Rounded) + `<Icon>`
- ✅ Componentes base en `src/components/ui/`: Text, Raised, Button, LinkButton, IconButton, Card, IconTile, ListRow, Chip, Tag, Segmented, ToggleRow, Checkbox, Stepper, Stars, Field, Avatar, AvatarStack, Screen, Header, RootHeader, Row, Stack, Spacer, Enter, Pop, Banner, StatusIcon, StateBlock, Skeleton, ErrorCard, Sheet. Además, `OtpInput`, `OfflineBanner` y `NotConfigured`
- ✅ Esquema Supabase `supabase/migrations/20261029120000_init.sql`:
  - tablas, RLS en todas, RPC que deciden en el servidor y Storage;
  - **50 pruebas de seguridad en verde** (`supabase/tests`, PGlite).
  - Reemplaza la lista de tablas y Edge Functions del plan original: validación de asistencia, doble ciego y borrado de cuenta quedaron como RPC SQL, sin Edge Functions.
- ✅ Capa de datos: `src/lib/` (cliente con sesión en SecureStore, `api.ts` con zod, `auth.tsx` con OTP, `errors.ts`, `format.ts`, `media.ts`, `notifications.ts` locales)
- ✅ Layout raíz con `Stack.Protected` (sin sesión → `(auth)`, registro incompleto → `onboarding`, dentro → `(tabs)` + interiores), `index.tsx` que redirige y `app.json` (nombre, ícono, splash, permisos)
- ✅ Pantallas (36 rutas). Todas compilan, pasan `expo lint` y `expo-doctor` (20/20), y el bundle de Android se genera (`npx expo export --platform android`):
  - `(auth)`: bienvenida animada, login con código y registro con autorización de datos;
  - `onboarding`: carné + 18+ y perfil;
  - `(tabs)`: barra de 5 pestañas + burbuja "+" con sus hojas; Inicio, Eventos, Wheels y Tours (Próximamente) y Mis planes;
  - `events/`: feed con swipe (gesto, botones y acciones accesibles, filtro por categoría, estados vacío y fin) y crear plan;
  - `plan/[id]/`: detalle, confirmar, lleno, dentro, chat Realtime, día del plan, calificar, cancelar, cancelado, gestionar y validar asistencia;
  - `me/`: perfil, editar, ajustes (tema y recordatorios), privacidad (visibilidad, exportar datos, eliminar cuenta) y bloqueados;
  - `report`, `legal/[doc]` (borradores) y `+not-found`.
- ⬜ **Aplicar la migración en el proyecto Supabase del usuario** y configurar el correo (`supabase/README.md`)
- ⬜ Probar el flujo completo en Expo Go (iPhone) y Android con 2–3 cuentas reales, y corregir lo que aparezca
- ➖ Panel web interno (pasa a P1; para el 16 se revisa desde el panel de Supabase)
- **Salida:** flujo P0 usable de punta a punta en Expo Go (iPhone) y en Android

### E3 · Automatizaciones — ⬜ · Profundidad: Estándar
- ⬜ CI en GitHub Actions: lint, typecheck, tests, tests de RLS
- ⬜ EAS Build: APK interno de Android (y build de iOS si hay cuenta de Apple)
- ⬜ Notificación push del recordatorio 1 h antes con cron de Supabase
- ⬜ Plantilla del email de código OTP en Supabase con el texto de Junto
- ➖ e2e con Maestro, emails con marca, Sentry (pasan a después del 16)
- **Salida:** cada cambio en GitHub pasa lint, typecheck y tests, y genera un APK instalable

### E4 · Seguridad — ⬜ · Profundidad: Estándar para el 16 → Completo después
- ⬜ Checklist de lanzamiento
- ⬜ Barrido rápido
- ⬜ Revisión guiada de las zonas críticas: RLS por campus, chat, bucket de carnés, código de asistencia, OTP; la hace un agente distinto del que construyó
- ⬜ Tests de aislamiento entre campus y entre planes
- ➖ Auditoría completa de 6 fases y CSP del panel web (P1, después del 16)
- ⬜ Cierre de los ❓ legales (Ley 1581) y test de la regla 18+
- **Salida:** sin hallazgos altos ni críticos abiertos

### E5 · Optimización y pulido — ⬜ · Profundidad: Estándar
- ⬜ Revisión rápida de rendimiento (fluidez del swipe en un Android de gama media)
- ⬜ Accesibilidad final (TalkBack y VoiceOver en el flujo central)
- ⬜ Pulido de UX, copy y movimiento
- ⬜ Datos de demo realistas en Supabase (planes del campus, usuarios de prueba)
- ➖ Ficha de las tiendas (P1)
- **Salida:** APK final instalado en los celulares de la demo y guion de la presentación

## Relevo

> Lo actualiza cada agente al terminar su sesión (ver references/agents.md §4). El siguiente agente lo lee primero.

- **Último agente:** Claude Code (Claude Opus 5.5)
- **Etapa:** E2 casi completa (2026-10-29). Todo el código del MVP está escrito y compila; falta conectarlo a Supabase y probarlo en teléfonos.
- **Hecho en esta sesión:** E0, E1 aprobado y E2 (ver checklist de E2 arriba).
- **Siguiente paso concreto:**
  1. **Supabase (lo hace el usuario, ~15 min):** seguir `supabase/README.md` §1:
     - crear el proyecto;
     - ejecutar la migración;
     - OTP de 6 dígitos y plantillas con `{{ .Token }}`;
     - SMTP con Gmail;
     - `mobile/.env`.
  2. **Probar en Expo Go** con 2–3 cuentas `@unbosque.edu.co` (`cd mobile && npx expo start`):
     - registro → carné (aprobarlo a mano según `supabase/README.md` §2) → perfil;
     - crear plan con otra cuenta → feed y swipe → confirmar → chat → validar código → calificar;
     - cancelar dentro y fuera de plazo;
     - bloquear y reportar.
  3. Corregir lo que salga en la prueba real.
  4. Cerrar E2 con el usuario y pasar a E3 (CI + APK con EAS).
- **Pendientes conocidos de E2:**
  - **Detalle del plan:** es una pantalla empujada, no una hoja inferior como en el diseño. Aceptable; se puede volver hoja en E5.
  - **Fotos:** las de perfil y de los planes están en un bucket público con rutas aleatorias (riesgo bajo, anotado en SECURITY.md).
  - **Borrado de carnés a los 30 días:** es manual; el cron es para E3.
  - **Avisos sin push:** "Avisarme si se libera" y "Avisarme cuando abra" solo guardan la preferencia; el aviso requiere push (P1).
- **Archivos tocados:** `CLAUDE.md`, `PROJECT-BRIEF.md`, `SECURITY.md`, `ROADMAP.md`, `DESIGN.md`, `design/**`, `mobile/**` y `supabase/**` (nuevos). `docs/` no se tocó. Nada está en commits todavía.
- **Cómo verificar:**
  - `cd mobile && npx tsc --noEmit && npx expo lint && npx expo-doctor`;
  - `npx expo export --platform android` (bundle);
  - `cd supabase/tests && npm install && npm test` → 50 ok.
- **Preguntas abiertas para el usuario:** crear el proyecto de Supabase y el SMTP; primer commit cuando lo pida.
- **No tocar / ojo con:**
  - el HTML de Claude Design es referencia, no se pega en la app;
  - `icons.generated.ts` se genera con `npm run icons`;
  - no añadir módulos nativos fuera de Expo Go;
  - `npm audit` marca una zod vieja dentro de la CLI de Expo (no llega a la app; la del proyecto es 4.6.7) → revisar en E4.

## Decisiones

| Fecha | Etapa | Decisión | Motivo |
|---|---|---|---|
| 2026-10-29 | E0 | Expo (React Native) + TypeScript | Una base para iOS y Android; el diseño ya está en React |
| 2026-10-29 | E0 | Supabase | Auth OTP, Storage privado, Realtime para el chat y RLS para el aislamiento por campus |
| 2026-10-29 | E0 | Alcance: MVP Eventos; Wheels y Tours "Próximamente" | Fase 1 de `docs/06-negocio/02-mvp-y-fases.md` |
| 2026-10-29 | E0 | Login con código al correo, sin contraseña | El prototipo pedía contraseña de 4+ caracteres; el código elimina contraseñas filtrables |
| 2026-10-29 | E0 | Primer campus: Universidad El Bosque | El prototipo ya lo usa; regla "un campus a la vez" |
| 2026-10-29 | E0 | Seguridad Completa en E4 | Documentos de identidad y encuentros en persona |
| 2026-10-29 | E0 | Claude Design como fuente visual | Diseño entregado por el usuario |
| 2026-10-29 | E0 | Edad mínima 18 años | Decisión del usuario; evita tratar datos de menores (art. 7 Ley 1581) |
| 2026-10-29 | E0 | Contacto de seguridad: chernandezmu@unbosque.edu.co | Decisión del usuario |
| 2026-10-29 | E2 | Recordatorio = notificación local; sin mapa embebido; todo el acceso a datos por RPC (tablas cerradas por RLS); sesión en SecureStore | Funciona en Expo Go sin servidor de push ni claves de Google; el servidor decide (SECURITY.md) |
| 2026-10-29 | E1 | Barra inferior de 5 pestañas (Inicio · Eventos · Wheels · Tours · Mis planes); Crear es una burbuja "+" que flota sobre la pestaña Mis planes, en Inicio, Eventos, Wheels y Tours | Decisión del usuario. `docs/05-interfaz/02-navegacion.md` (3 destinos) queda desactualizado |
| 2026-10-29 | E0 | Plazo: 2026-11-16 | Entrega de la clase de Lenguajes Digitales (Start-ups) |
| 2026-10-29 | E0 | Sin cuenta de Apple Developer: en iPhone la demo corre en Expo Go | La app debe seguir siendo compatible con Expo Go (solo módulos incluidos en Expo Go, misma versión de SDK que la app Expo Go de las tiendas). En iPhone no hay push |
| 2026-10-29 | E0 | "Listo" = demo funcional en celulares, sin publicar en tiendas | Las tiendas no caben en 18 días (Google exige 14 días de prueba cerrada) |
| 2026-10-29 | E0 | Alcance recortado al flujo central; panel web, emails con marca, push restante y auditoría completa pasan a P1 | Ajuste al plazo, elegido por el usuario. Riesgo aceptado: la seguridad antes del 16 es revisión guiada, no auditoría completa |

## Riesgos y supuestos

- Feed vacío al lanzar (pocas publicaciones): mitigación en `docs/07-riesgos/` (ritual semanal garantizado por el equipo).
- La revisión manual de carnés en < 24 h exige que alguien del equipo revise a diario.
- La revisión de Apple para apps con contenido de usuarios exige reportar, bloquear, moderar y eliminar la cuenta en la app: ya está en el P0.
- Las notificaciones push no funcionan en Expo Go: hace falta un build de desarrollo desde E2.
- Ver también los supuestos de `PROJECT-BRIEF.md`.

## Pendientes ❓ (needs_validation)

| Qué | Quién lo comprueba | Cómo |
|---|---|---|
| Política de datos (Ley 1581) | Equipo | Ver `SECURITY.md` §6 |
| Autorización de la universidad si se lanza fuera de la clase | Equipo | Consulta a la universidad |
| Umbrales de las métricas (retención semana 4, densidad) | Equipo | Antes del lanzamiento (`docs/08-anexos/03-decisiones-pendientes.md`) |
