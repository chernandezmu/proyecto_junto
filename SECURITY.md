# SECURITY · Junto

> Modelo de amenazas breve del proyecto (ux-ui-and-code-skill). Se creó al cerrar el arranque guiado (E0) con los pasos 2, 9 y 10; se actualiza en cada etapa y se cierra en E4. Todos los agentes lo leen antes de tocar auth, datos, archivos, notificaciones o despliegue.
>
> Controles de producto ya definidos por el equipo: [docs/03-producto/07-seguridad-y-privacidad.md](docs/03-producto/07-seguridad-y-privacidad.md).

**Profundidad acordada:** Estándar (revisión guiada) para la demo del 2026-11-16 → Completo (auditoría de 6 fases) antes de cualquier lanzamiento público. Los controles de §3 y §4 se aplican igual desde la primera línea de código.
**Ley de datos aplicable:** Colombia · Ley 1581 de 2012 (Habeas Data) y Decreto 1377 de 2013. **Edad mínima: 18 años.** No se tratan datos de menores: la fecha de nacimiento se pide en el registro y se contrasta con el carné en la revisión.
**Última revisión:** 2026-11-03 · Claude Code (E4 · revisión guiada, hecha por el mismo agente que construyó; ver §5)

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
| Dependencias y CI | Lockfile, `npm audit` en CI, secret scanning de GitHub, permisos mínimos en los workflows, versiones fijas de las actions | ⏳ CI con acciones fijadas por SHA, `contents: read`, sin credenciales persistidas y auditoría informativa; Dependabot configurado. Falta activar el secret scanning en GitHub ❓ |
| Privacidad | Datos mínimos; ubicación solo del punto de encuentro, nunca la del usuario; logs sin datos personales; descargar datos y eliminar cuenta en la app (también lo exigen Apple y Google) | ⏳ |
| Moderación | Reportar plan y usuario, bloquear, normas visibles, revisión de reportes en el panel en < 24 h (requisito de las tiendas para apps con contenido de usuarios) | ⏳ |
| Notificaciones | Tokens push ligados al usuario, enviados solo desde el servidor; sin contenido sensible en el texto de la notificación | ⬜ |
| Operación | Sentry (app y funciones) con datos personales filtrados, alertas, contacto de seguridad, plan de incidentes (§7) | ⬜ |

## 5. Hallazgos (E4)

**Revisión guiada · 2026-11-03.**
- **Alcance:**
  - `supabase/migrations/20261029120000_init.sql`: tablas, RLS, las 30 RPC, triggers y Storage;
  - `mobile/src` (sesión, datos, deep links, archivos, logs);
  - `.github/`, dependencias y el bundle de Android.
- **Clases buscadas:** control de acceso y aislamiento entre campus, lógica de negocio (cupo, plazos, doble ciego, rechazos), privacidad, abuso, secretos, cliente móvil y cadena de suministro.
- **Independencia:** la hizo el mismo agente que construyó el código. La skill recomienda una segunda pasada con otro agente (pendiente, §6).

| Severidad | Hallazgo | Estado | Test de regresión |
|---|---|---|---|
| Media | **H1 · "Solo mis planes" no se respetaba.** Un estudiante verificado del campus que no comparte el plan veía en "Quién va" el nombre, la foto y la carrera de quien eligió *Quién ve mi perfil: Solo mis planes* (`get_plan` usaba `private.person` sin mirar `visibility`) | ✅ Arreglado en `20261103120000_e4_seguridad.sql` (`private.attendee`): se muestra como "Estudiante", sin foto ni carrera | `H1 · Nora (no comparte el plan) ve a Luis anónimo` + 2 de control |
| Baja | **H2 · Doble ciego roto sin asistencias validadas.** Si el organizador no validaba ningún código, cada calificación se revelaba al instante y podía deducir la nota de cada persona viendo cambiar su promedio | ✅ Se revela a los 3 días, o cuando calificaron **todos** los que llegaron y llegó alguien | `H2 · la nota de Nora no se revela todavía` |
| Baja | **H3 · Re-solicitudes tras un rechazo.** Una persona rechazada podía volver a pedir cupo sin límite (acoso al organizador) y el plan le seguía saliendo en el feed | ✅ `join_plan` responde `REJECTED`; el plan sale de su feed; la app lo explica | `H3 · Nora no puede volver a pedir` · `H3 · el plan sale de su feed` |

**Segunda revisión · 2026-11-03.**
- **Quién:** un agente independiente, sin el contexto de quien construyó, en solo lectura y validando cada caso en PGlite.
- **Resultado:** encontró que H1 y H2 estaban incompletos y que E1 se podía saltar, además de dos problemas nuevos.
- **Arreglos:** todo está en `supabase/migrations/20261103130000_e4_revision2.sql`.

| Severidad | Hallazgo | Estado | Test de regresión |
|---|---|---|---|
| Media | **C1 · H1 se saltaba con bloquear.** Con el `id` real del asistente anónimo, `block_user` + `get_blocked` devolvían su nombre, foto y carrera, incluso desde otro campus o sin carné. El `id` fijo también permitía seguir a la persona entre planes | ✅ Arreglado: la entrada anónima lleva un `id` aleatorio, `block_user` solo acepta a gente del propio campus y `get_blocked` respeta la visibilidad | 5 pruebas `C1 · …` |
| Baja | **C2 · Doble ciego aún deducible.** Validando asistencias de a poco, la nota de quien no llegó se veía al instante | ✅ Antes de 3 días solo cuentan las notas de quien llegó, con el plan terminado, ≥ 2 validados y todos con nota | 3 pruebas `C2 · …` |
| Baja | **C3 · El límite de `check_in` no contaba los fallos.** El `raise` deshacía el contador: 503 intentos fallidos y acierto en el 504 | ✅ Un código incorrecto devuelve `{error:'BAD_CODE'}` sin `raise` y el intento queda contado. La app lo adapta | `C3 · el sexto intento queda bloqueado` |
| Baja | **C4 · E1 se saltaba con una ruta inventada.** Se pasaba a "en revisión" sin subir el carné | ✅ El archivo debe existir en `verifications` y ser del propio usuario. Máximo 3 envíos al día | 3 pruebas `C4 · …` |
| Baja | **C5 · Mensajes de sistema suplantables.** El `full_name` + `mark_arrived` publicaba un aviso "de sistema" sin autor ni opción de reportar, también en planes cancelados | ✅ Ahora es un mensaje normal del autor, solo en planes publicados y desde 2 h antes | 4 pruebas `C5 · …` |

Notas de la segunda revisión que también se aplicaron:
- el dominio se lee tras la **última** `@`;
- el plan rechazado sale de "Hoy" en Inicio;
- `finish_plan` solo funciona después de la hora de inicio;
- la lista de espera exige poder ver el plan;
- Android `allowBackup: false`;
- el reporte o bloqueo desde el chat tiene acción accesible.

Pruebas: **92 ok**. Sin esta migración fallan las de C1, C2 y C3, y la ejecución se corta antes de llegar a C4 y C5.

**Pendientes de la segunda revisión** (endurecimiento, sin severidad; para antes de un lanzamiento público):
- Se puede alternar sin límite entre solicitud pendiente y retirada.
- `respond_request` no mira el estado del plan.
- `interests` no limita el largo de cada elemento.
- Bloquear no saca a la persona de los planes en curso.
- Revocar la verificación no cierra los chats.
- Las rutas de archivo admiten `..` dentro de la carpeta propia (sin impacto, porque las fotos son públicas).
- Falta `npm ci --ignore-scripts` en CI.

**Endurecimientos aplicados en la primera revisión** (no cruzaban un límite por sí solos):
- **E1:** para ver planes hay que haber enviado el carné (antes bastaba el correo).
- **E2:** la foto de perfil solo puede apuntar a la carpeta propia.
- **E3:** el correo de la cuenta solo puede cambiar a otro del mismo campus.
- **E4:** permisos explícitos para que `supabase_auth_admin` ejecute los triggers de `auth.users`.
- **Dependabot** activado.

Todos tienen prueba en la sección "E4" de `supabase/tests`: **67 ok** en ese momento. Sin la migración de arreglos fallan exactamente las 8 pruebas nuevas.

**Descartados:**
- `npm audit` marca 2 altas y 7 moderadas/bajas, todas en las herramientas de compilación de Expo (`@expo/cli`, su `zod` interna, `glob`, `minimatch`, `deepmerge`). Corren en la máquina del desarrollador con entrada de confianza y no van en el bundle de la app. Se resuelven actualizando Expo con `npx expo install --fix` cuando publique parches.
- El barrido de secretos del bundle marcó `sb_secret_`: es un falso positivo por dos cadenas internas pegadas ("ListVector**s**" + "**b_secret_**_internal…"). No hay claves.
- Fuerza bruta del código de asistencia: solo el organizador puede validar, con 5 intentos por minuto y por plan, y solo inflaría la asistencia de su propio plan.

**Notas para E5 (no son de seguridad):**
- Al eliminar una cuenta, sus planes se borran en cascada (también los pasados y su chat). Los inscritos no reciben el aviso de cancelación porque el plan desaparece.
- `private.rate_events` crece sin limpieza: falta un cron de limpieza (P1).

**Checklist de lanzamiento (demo del 16):**

| Área | Punto | Estado |
|---|---|---|
| Secretos | `.env` fuera del repo, `.env.example` presente, sin claves privadas con prefijo público | ✅ |
| Secretos | Ningún secreto en el bundle | ✅ (barrido del export de Android) |
| Auth | Proveedor probado (Supabase OTP), sesión en Keychain/Keystore | ✅ en código · ❓ en el proyecto real |
| Auth | Cada RPC valida y autoriza por recurso; RLS en todas las tablas | ✅ (67 pruebas) |
| Auth | Mensajes uniformes en login/registro; rate limit en OTP | ✅ en código · ❓ límites del proyecto |
| Entrada/salida | Sin HTML crudo, sin SQL concatenado; errores genéricos al usuario | ✅ |
| Entrada/salida | Subidas con límite, tipo y almacenamiento privado (carnés) | ✅ |
| Navegador (CSP, CORS, CSRF) | App nativa sin web | ➖ (aplica al panel web, P1) |
| Negocio | Pagos y webhooks | ➖ |
| Negocio | Cuota de correos | ❓ SMTP con Gmail (500/día); revisar el límite del proveedor |
| Negocio | Captcha en formularios públicos | ➖ (no hay formularios sin cuenta; el OTP tiene rate limit) |
| Operación | Dependencias auditadas, lockfile, CI con permisos mínimos | ✅ |
| Operación | Backups, entornos separados | ❓ |
| Operación | Política de privacidad, términos | ✅ borradores en la app · ❓ revisión legal |
| Base de datos | RLS completo, `security definer` con `search_path` vacío, buckets con políticas | ✅ |
| Base de datos | Usuario A no lee ni edita datos de B; sin sesión no se lee nada | ✅ (pruebas) |
| Base de datos | Restauración de backup probada | ❓ |
| Después | `security.txt`, alertas, plan de incidentes | ➖ app nativa · ✅ contacto en la app y plan en §7 |

## 6. Pendientes `needs_validation`

| Qué | Quién lo comprueba | Cómo |
|---|---|---|
| Política de tratamiento de datos, autorización explícita y canal de derechos (Ley 1581) | Equipo + asesoría legal | Redactar antes del lanzamiento; enlazar en el registro y en Ajustes |
| Regla 18+ en la revisión humana | Equipo | El servidor ya rechaza fechas de menores (prueba `menor de 18 rechazado`). Falta que quien revisa el carné compruebe que la fecha declarada coincide con el documento (`supabase/README.md` §2) |
| ~~Segunda revisión de seguridad independiente~~ | Agente independiente | ✅ Hecha el 2026-11-03: 5 hallazgos (C1–C5) arreglados (§5) |
| Secret scanning y push protection en GitHub | Dueño del repo | Settings → Code security → activar "Secret scanning" y "Push protection" |
| Supabase: solo el proveedor Email activo, "Secure email change" activado, Security Advisor sin alertas rojas | Equipo | `supabase/README.md` §1, pasos 6 y 8 |
| Backups y restauración | Equipo | El plan gratis de Supabase no tiene PITR: exportar un dump (`supabase db dump`) antes de la demo y probar restaurarlo en otro proyecto |
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
