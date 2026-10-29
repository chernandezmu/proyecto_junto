# PROJECT-BRIEF · Junto

> Generado por ux-ui-and-code-skill en el arranque guiado (E0), el 2026-10-29. Fuente de verdad del proyecto junto a `DESIGN.md` y `ROADMAP.md`. Lo marcado **Supuesto** lo decidió el agente con defaults; cámbialo si no encaja.
>
> La documentación de producto completa está en [`docs/`](docs/README.md). Este brief no la repite: la resume y fija las decisiones técnicas.

## 1. Tipo de proyecto
- **Tipo:** App móvil (iOS y Android).
- **Mercado / sector:** Vida social universitaria. Estudiantes de Bogotá, empezando por un solo campus.
- **Elementos principales:** login verificado con correo institucional, subida de documento (carné), feed con swipe, chat por plan, mapa del punto de encuentro, notificaciones push, calificaciones, panel interno de revisión.

## 2. Tecnología
- **Framework:** Expo (React Native) con TypeScript y Expo Router.
- **Base de datos:** Supabase: Postgres, Auth, Storage, Realtime y Edge Functions.
- **Hosting:** Supabase Cloud para el backend. EAS Build y EAS Submit para App Store y Google Play.
- **Panel de revisión de carnés:** web interna aparte (stack en E2; **Supuesto**: Next.js sobre el mismo Supabase).
- **Origen:** elegido por el usuario en E0. El repo no tenía código.

## 3. Diseño
- **Origen:** diseño propio hecho en Claude Design (`Junto App.dc.html`). Copia de referencia en [`design/claude-design/`](design/claude-design/).
- **Familia y estilo:** limpio y cercano, de producto. Tarjetas redondeadas, botones tipo píldora, acentos pastel sobre fondo violeta casi negro.
- **Identidad:** product-shadcn (tokens semánticos con nombres estilo shadcn) más las reglas nativas de la skill (`references/ux/native-app-rules.md`). El look es el de Claude Design, no un estilo shadcn de catálogo.
- **Modo:** claro y oscuro. **Oscuro por defecto.**
- **Movimiento:** estándar. El protagonista es el swipe de tarjetas (tarjetas apiladas con rotación de −10° a 12°). Todo con `reduceMotion` respetado.

## 4. Colores
Valores extraídos del prototipo de Claude Design. En E1 se convierten en tokens en `DESIGN.md`.

| Rol | Oscuro | Claro | Origen |
|---|---|---|---|
| Fondo (`--background`) | `#16141d` | `#f7f4ee` | Claude Design |
| Superficie (`--card`) | `#211e2b` | `#fffdf9` | Claude Design |
| Superficie 2 (`--muted`) | `#2c2839` | `#eee9e0` | Claude Design |
| Texto (`--foreground`) | `#f3f0fa` | `#1c1631` | Claude Design |
| Texto secundario (`--muted-foreground`) | `#aaa4bd` | `#5d5770` | Claude Design |
| Acento / CTA (`--primary`) | `#e4f47c` lima, texto encima `#16141d` | igual | Claude Design + ícono |
| Secundarios de módulo / estado | menta `#a6e8cc` · celeste `#a7d6f6` · lila `#c9b8ff` · durazno `#f7c99a` | igual (solo como relleno) | Claude Design |
| Peligro (`--destructive`) | coral `#ff8a8a` | igual (solo como relleno) | Claude Design |

- **Contraste comprobado (WCAG):**
  - **Oscuro:** texto 16,2:1 · secundario 7,6:1 · lima 15,2:1 · menta 13:1 · lila 10,2:1 · coral 8:1. Todo pasa.
  - **Claro:** texto 15,8:1 · secundario 6,3:1. Pasa.
  - **Ajuste obligatorio en claro:** el lima (1,09:1) y el coral (2,07:1) **no pueden usarse como texto ni como icono** sobre el fondo claro, solo como relleno con texto `#16141d` encima. Para error en texto hace falta un coral oscuro (se define en E1).

## 5. Tipografías
- **Títulos:** Bricolage Grotesque. **Texto:** Lexend. **Iconos:** Material Symbols Rounded.
- **Licencia:** las tres son de Google Fonts (OFL / Apache 2.0). Se cargan con `expo-font` empaquetadas en la app, sin CDN.
- **Escala:** el prototipo usa 10, 12, 13, 14, 15, 18, 20, 22, 28, 30, 32, 34, 40, 48 y 52 px. En E1 se reduce a una escala de 7–8 pasos. El texto de cuerpo debe quedar en ≥ 16 px; el prototipo usa 13–14 en mucho texto y hay que subirlo.

## 6. Logo y recursos
- **Logo:** subido. Ícono "J" negro sobre lima, con esquinas redondeadas ([`design/claude-design/junto-app-icon.png`](design/claude-design/junto-app-icon.png), 400×400).
- **Pendiente:** el ícono a 1024×1024 sin transparencia para las tiendas, el ícono adaptativo de Android y el splash. Se generan en E2 a partir del original o se piden en vectorial.
- **Otros recursos:** imágenes de los planes las sube cada organizador. Los iconos de categoría son de Material Symbols.

## 7. Apartados
- **Formato:** app con barra inferior de 5 pestañas (Inicio · Eventos · Wheels · Tours · Mis planes). El botón Crear es una burbuja "+" que flota sobre la pestaña Mis planes (en Inicio, Eventos, Wheels y Tours), y el perfil se abre desde el avatar. Cambia lo descrito en [docs/05-interfaz/02-navegacion.md](docs/05-interfaz/02-navegacion.md) (3 destinos); el detalle está en `DESIGN.md` y `design/pages/mvp.md`.

| Apartado | Prioridad |
|---|---|
| Bienvenida + registro verificado (correo, carné, perfil) + login con código | P0 |
| Inicio (próximo plan + accesos de módulo) | P0 |
| Eventos · asistente: feed con swipe, detalle, confirmar, lleno, estás dentro, chat, día del plan, calificación, cancelar | P0 |
| Eventos · organizador: crear, quién puede unirse, publicado, solicitudes, validar asistencia | P0 |
| Mis planes, Perfil, Ajustes (tema, notificaciones), Privacidad y seguridad (bloquear, reportar, eliminar cuenta, descargar datos) | P0 |
| Normas de la comunidad, política de tratamiento de datos, términos | P0 (legal) |
| Revisión de carnés desde el panel de Supabase | P0 (operación) |
| Panel web interno de carnés y reportes, emails con marca, push restante | P1 (después del 16 de noviembre) |
| Pestañas Wheels y Tours con pantalla "Próximamente" y "Avisarme cuando abra" | P0 (solo visual) |
| Ritual semanal, racha, participación en el perfil (Fase 2) | P1 |
| Wheels completo (Fase 3) | P2 |
| Tours y segundo campus (Fase 4) | P2 |

- Siempre: estados vacío, carga y error en cada pantalla, pantalla de "sin conexión" y ruta no encontrada.

## 8. De qué trata
Junto es la puerta de entrada de un campus a su vida social: un estudiante desliza entre los planes de su propia universidad y entra a uno en un toque, o publica el suyo. Lo diferente es que todos están verificados como estudiantes del mismo campus, y que el swipe es sobre planes, nunca sobre personas. Debe sentirse fácil, seguro y hecho para gente de mi universidad.

## 9. Público y enfoque
- **Público:** estudiantes de la Universidad El Bosque, con foco en primeros semestres, traslados y quienes tienen poca vida social en el campus.
- **Qué quiere lograr:** que un estudiante asista a su primer plan en menos de 7 días y repita cada semana. La métrica principal es **asistencias por semana** confirmadas con código.
- **Estudio o datos:** no (las métricas son internas).
- **Dispositivo principal:** móvil.
- **Idiomas:** español (Colombia). **Supuesto:** inglés no entra en el MVP, aunque Ajustes muestra "Idioma".
- **País / ley de datos:** Colombia, Ley 1581 de 2012 (Habeas Data). **Edad mínima: 18 años**. Se pide la fecha de nacimiento en el registro y se contrasta con el carné en la revisión; si la persona es menor, la verificación se rechaza.
- **Contexto:** proyecto de la clase de Lenguajes Digitales (Start-ups) en la Universidad El Bosque. **Plazo: 18 días (16 de noviembre de 2026).**

## 10. Seguridad y extras
- **Acceso de usuarios:** código de un solo uso al correo `@unbosque.edu.co`, sin contraseña. Mismo mecanismo en el registro y en el login.
- **Qué hay que proteger:**
  - cuentas;
  - documentos de identidad (carnés);
  - datos de perfil;
  - chats;
  - ubicación de los puntos de encuentro;
  - aislamiento entre campus;
  - la regla de edad mínima (18+).

  Hay subida de archivos, sin pagos en el MVP y sin IA.
- **Profundidad de seguridad:** Estándar (revisión guiada) para la demo del 16 de noviembre; **Completa** (auditoría de 6 fases) antes de un lanzamiento público.
- **Entrega del 16 de noviembre:** demo funcional en celulares (APK de Android, Expo Go o TestFlight en iPhone), sin publicar en tiendas. Alcance y calendario en `ROADMAP.md`.
- **Detalle:** ver [`SECURITY.md`](SECURITY.md).
- **Extras:** CI + EAS, notificaciones push, emails transaccionales con marca, panel de revisión de carnés.

## Supuestos
- **Supuesto:** el panel interno es una web en Next.js sobre el mismo Supabase, solo para cuentas del equipo con rol `reviewer`.
- **Supuesto:** el código de verificación por correo es de 6 dígitos (el que da Supabase Auth), no de 4 como en el prototipo. Es más difícil de adivinar; el diseño se ajusta.
- **Supuesto:** el código de asistencia del día del plan sigue siendo de 4 dígitos, pero es único por asistente, solo vale en la ventana del plan y tiene límite de intentos.
- **Supuesto:** el plazo de cancelación gratuita lo fija el organizador por plan, con un default de 3 h antes. La documentación lo deja sin regla general.
- **Supuesto:** los carnés se borran del almacenamiento a los 30 días de aprobada o rechazada la verificación. Solo queda el resultado (principio de mínimo dato).
- **Supuesto:** el motor de diseño de la skill no se usa: requiere Python y no está instalado. El diseño ya viene de Claude Design.

## Resumen de stack (E2)
```
Stack:      Expo SDK (última estable) + TypeScript + Expo Router · Supabase (Postgres, Auth OTP, Storage, Realtime, Edge Functions) · EAS Build/Submit/Update
Identidad:  Claude Design "Junto App" → tokens semánticos (DESIGN.md), oscuro por defecto
Usar:       expo-font, expo-secure-store (sesión), expo-notifications, expo-image, react-native-reanimated + gesture-handler (swipe), react-native-maps o expo-maps (punto de encuentro), zod (validación), TanStack Query (datos), Supabase JS
Omitir:     librerías de UI web (shadcn/Tailwind web) en la app; pagos; mapas en vivo (es Wheels, fase 3)
Quitar:     —
Seguridad:  RLS en todas las tablas con campus_id, bucket privado para carnés con URLs firmadas, dominio de correo validado en el servidor (Auth hook), rate limit en OTP y en el código de asistencia
```
