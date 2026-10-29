# SECURITY · Junto

> Modelo de amenazas breve del proyecto (ux-ui-and-code-skill). Se creó al cerrar el arranque guiado (E0) con los pasos 2, 9 y 10; se actualiza en cada etapa y se cierra en E4. Todos los agentes lo leen antes de tocar auth, datos, archivos, notificaciones o despliegue.
>
> Controles de producto ya definidos por el equipo: [docs/03-producto/07-seguridad-y-privacidad.md](docs/03-producto/07-seguridad-y-privacidad.md).

**Profundidad acordada:** Estándar (revisión guiada) para la demo del 2026-11-16 → Completo (auditoría de 6 fases) antes de cualquier lanzamiento público. Los controles de §3 y §4 se aplican igual desde la primera línea de código.
**Ley de datos aplicable:** Colombia · Ley 1581 de 2012 (Habeas Data) y Decreto 1377 de 2013. **Edad mínima: 18 años.** No se tratan datos de menores: la fecha de nacimiento se pide en el registro y se contrasta con el carné en la revisión.
**Última revisión:** 2026-10-29 · Claude Code (E0)

## 1. Qué protegemos (activos)

| Activo | Dónde vive | Por qué importa |
|---|---|---|
| Cuentas de estudiante | Supabase Auth (OTP por correo) | Suplantar a un estudiante verificado rompe toda la confianza del producto |
| Carnés / certificados de matrícula | Supabase Storage, bucket **privado** `verifications` | Documento de identidad: fuga = daño grave y sanción por Ley 1581 |
| Perfil (nombre, foto, carrera, semestre, intereses) | Tabla `profiles` | Datos personales; base para acoso si se exponen fuera del campus |
| Chats de cada plan | Tabla `messages` + Realtime | Conversaciones privadas entre miembros del plan |
| Lugar y hora de los planes | Tabla `plans` | Saber dónde estará alguien y cuándo |
| Códigos de asistencia | Tabla `attendance` | Inflar asistencias falsea la métrica principal y la reputación |
| Calificaciones (doble ciego) | Tabla `ratings` | Ver una calificación antes de tiempo permite represalias |
| Reportes y bloqueos | Tablas `reports`, `blocks` | Proteger a quien reporta |
| Tokens de notificaciones push | Tabla `push_tokens` | Enviar avisos falsos a usuarios |
| Panel de revisión | Web interna, rol `reviewer` | Acceso a todos los carnés |
| Secretos | `service_role` de Supabase, credenciales de email y de EAS, en variables de entorno del servidor o CI | Acceso total a la base de datos |
| Cuota de correos | Proveedor de email (OTP y transaccionales) | Abuso del envío de códigos = factura y reputación del dominio |

## 2. Quién puede atacar

- **Anónimo:** quiere entrar sin ser estudiante (correo ajeno, dominio falso) o lanzar spam de códigos.
- **Estudiante verificado malicioso:** acoso, leer chats de planes ajenos, ver perfiles de otro campus, falsear asistencia o calificaciones.
- **Organizador malicioso:** plan falso para atraer a alguien a un lugar.
- **Persona de otra universidad:** intenta ver el feed de El Bosque.
- **Revisor con cuenta robada o malintencionado:** descarga masiva de carnés.
- **Cadena de suministro:** dependencia de npm comprometida, o secreto filtrado en el repo o en CI.

## 3. Límites de confianza

| Límite | Control | Dónde está en el código |
|---|---|---|
| App → Supabase | La app solo tiene la clave `anon`; toda regla vive en **RLS** y en Edge Functions. Validación con zod en las funciones | E2 · `supabase/migrations`, `supabase/functions` |
| Correo cualquiera → cuenta | Dominio `@unbosque.edu.co` validado **en el servidor** (Auth hook `before-user-created`), no solo en la app | E2 |
| Estudiante sin carné aprobado → feed | `profiles.verification_status = 'approved'` exigido por RLS para leer y crear planes | E2 |
| Campus A → campus B | `campus_id` en cada tabla, derivado del dominio del correo (nunca enviado por el cliente) + RLS + test de aislamiento | E2 / E3 |
| Usuario → chat de un plan | Solo miembros confirmados del plan leen y escriben (RLS + autorización del canal Realtime) | E2 |
| Usuario bloqueado → quien lo bloqueó | Bloqueo aplicado en RLS: no ve sus planes, perfil ni mensajes | E2 |
| Asistente → código de asistencia | Validación en Edge Function: código por asistente, ventana del plan, máx. 5 intentos | E2 |
| Calificación → otra parte | La calificación es invisible hasta que ambas partes califican o vence el plazo (vista o función en el servidor) | E2 |
| Usuario → carné | Solo el dueño sube a su carpeta; nadie lo lee salvo `reviewer`, con URL firmada de corta duración y registro de acceso | E2 |
| Panel interno → datos | Rol `reviewer` asignado a mano; 2FA obligatorio; cada visualización de carné queda registrada | E2 / E3 |
| Formulario y OTP → correo | Rate limit por IP y por correo, respuestas uniformes (sin revelar si el correo existe) | E2 |

## 4. Controles por área

⏳ = implementado en código y probado en PGlite (`supabase/tests`), falta verificarlo en el proyecto real.

Estado: ✅ hecho · ⏳ en curso · ⬜ pendiente · ➖ no aplica · ❓ needs_validation (depende del proveedor/hosting)

| Área | Control | Estado |
|---|---|---|
| Secretos | `.env` fuera del repo; en la app solo `EXPO_PUBLIC_SUPABASE_URL` y la clave `anon` (todo `EXPO_PUBLIC_*` es público); `service_role` solo en Edge Functions y en el panel | ⏳ |
| Auth | OTP de Supabase, sesión guardada en `expo-secure-store`, códigos que caducan, respuestas uniformes, cierre de sesión en todos los dispositivos | ⏳ |
| Autorización | Denegar por defecto; RLS activado en **todas** las tablas; políticas por campus, por membresía y por bloqueo | ⏳ |
| Base de datos | RLS + tests de políticas (pgTAP o tests de integración), backups de Supabase activos, migraciones versionadas | ⏳ |
| Entrada/salida | Esquemas zod en Edge Functions, `CHECK` en Postgres (longitudes, cupos > 0, fechas futuras), texto de chat sin HTML | ⏳ |
| Archivos | Carnés: solo imagen o PDF, ≤ 10 MB, bucket privado, URLs firmadas ≤ 60 s, borrado a los 30 días de la revisión. Fotos de perfil y de planes: tipo y tamaño, metadatos EXIF (GPS) eliminados | ⏳ |
| Cabeceras | Solo el panel web: CSP, HSTS, nosniff, Referrer-Policy, `frame-ancestors 'none'` | ⬜ |
| Abuso | Rate limit en OTP, reenvío de código, creación de planes, mensajes, reportes y validación de asistencia; límite de planes simultáneos por organizador | ⏳ |
| Pagos | Fuera del MVP (Wheels y Tours, fases 3 y 4) | ➖ |
| IA | No hay funciones de IA en el MVP | ➖ |
| Dependencias y CI | Lockfile, `npm audit` en CI, secret scanning de GitHub, permisos mínimos en los workflows, versiones fijas de las actions | ⬜ |
| Privacidad | Datos mínimos; ubicación solo del punto de encuentro, nunca la del usuario; logs sin datos personales; descargar datos y eliminar cuenta en la app (también lo exigen Apple y Google) | ⏳ |
| Moderación | Reportar plan y usuario, bloquear, normas visibles, revisión de reportes en el panel en < 24 h (requisito de las tiendas para apps con contenido de usuarios) | ⏳ |
| Notificaciones | Tokens push ligados al usuario, enviados solo desde el servidor; sin contenido sensible en el texto de la notificación | ⬜ |
| Operación | Sentry (app y funciones) con datos personales filtrados, alertas, contacto de seguridad, plan de incidentes (§7) | ⬜ |

## 5. Hallazgos (E4)

| Severidad | Hallazgo | Estado | Test de regresión |
|---|---|---|---|

## 6. Pendientes `needs_validation`

| Qué | Quién lo comprueba | Cómo |
|---|---|---|
| Política de tratamiento de datos, autorización explícita y canal de derechos (Ley 1581) | Equipo + asesoría legal | Redactar antes del lanzamiento; enlazar en el registro y en Ajustes |
| Regla 18+ aplicada | Agente E2 / E4 | `CHECK` en la base de datos (fecha de nacimiento ≥ 18 años), la revisión del carné rechaza a los menores, y test que intenta registrar a un menor |
| Uso del dominio y el nombre de El Bosque fuera de la clase | Equipo | Hoy es un proyecto de la clase de Lenguajes Digitales (Start-ups). Si se lanza en público, hace falta autorización de la universidad |
| Región de los datos en Supabase y transferencia internacional (la Ley 1581 la regula) | Equipo | Elegir región y declararlo en la política |
| Límites reales de rate limit del Auth de Supabase y del proveedor de email | Agente E2 / E4 | Revisar la configuración del proyecto Supabase |
| El trigger en `auth.users` que bloquea dominios no permitidos funciona en el proyecto real (se usó trigger en lugar de Auth hook) | Agente E2 | Intentar registrarse con un correo que no sea @unbosque.edu.co |
| `delete_my_account` puede borrar de `auth.users` con el rol dueño de la función | Agente E2 | Probar "Eliminar mi cuenta" con una cuenta de prueba |
| Fotos de perfil y de planes en bucket público (rutas aleatorias, no listables por otros) | Equipo | Aceptado para la demo; pasar a URLs firmadas antes del lanzamiento público |

## 7. Si algo sale mal

1. Contener: rotar el secreto o la clave afectada, desactivar la función o el endpoint, suspender la cuenta implicada.
2. Evaluar: qué datos y qué usuarios, desde cuándo (logs de Supabase y Sentry).
3. Corregir con test de regresión y desplegar (EAS Update para la app, migración y función para el backend).
4. Avisar a los afectados y, si hay vulneración de datos personales, reportar a la Superintendencia de Industria y Comercio (SIC) en los 15 días hábiles que fija su reglamentación ❓.
5. Si el incidente es de seguridad física (acoso, encuentro peligroso): suspender las cuentas, conservar evidencia y dar al usuario el canal de ayuda de la universidad y la línea 123.
6. Anotar aquí qué pasó y qué se cambió.

Contacto de seguridad: **chernandezmu@unbosque.edu.co** (en Ajustes → Privacidad y seguridad, en la ficha de las tiendas y en el `security.txt` del panel web).
