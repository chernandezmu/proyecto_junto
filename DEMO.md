# Guion de la demo · Junto (16 de noviembre de 2026)

Recorrido de unos 7 minutos que muestra el ciclo completo de un plan con 3 celulares. Ensayarlo al menos una vez el día anterior con los mismos teléfonos y la misma red.

## Preparación (el día anterior)

| Qué | Cómo |
|---|---|
| Supabase listo | Las 3 migraciones aplicadas, el correo con código funcionando ([`supabase/README.md`](supabase/README.md)) |
| 3 cuentas `@unbosque.edu.co` **aprobadas** | Registrarlas en la app, subir el carné y aprobarlas en el panel (README §2) |
| Datos de demo | [`supabase/demo/seed_demo.sql`](supabase/demo/seed_demo.sql) con los correos de las cuentas **B y C** (no de la A, que crea un plan en vivo) |
| Teléfonos | Android con el APK instalado ([`mobile/README.md`](mobile/README.md)); iPhone con Expo Go y `npx expo start --tunnel` |
| Notificaciones | Aceptar el permiso en cada teléfono (para el recordatorio de 1 h antes) |
| Plan B | Grabar en video el recorrido completo por si falla la red del salón |

**Roles:**
- **A** organiza en vivo (proyectada en la pantalla).
- **B** es asistente y se une con swipe.
- **C** es asistente y muestra la privacidad y el chat.

## Recorrido

| # | Quién | Qué mostrar | Qué decir (idea) |
|---|---|---|---|
| 1 | A | Bienvenida animada → "Ya tengo cuenta" → código al correo | "Solo entra quien tiene correo de El Bosque: sin contraseñas, con un código" |
| 2 | A | Inicio: saludo, "verificada", accesos de módulo; tocar Wheels → "Próximamente" | "Eventos es el MVP; Wheels y Tours llegan en fases cuando haya comunidad" |
| 3 | A | Burbuja **+** → Evento → crear "Parche de estudio" para dentro de 2 h, cupos 3, "Todo mi campus" | "Cualquier estudiante verificado puede armar un plan en 30 segundos" |
| 4 | B | Pestaña Eventos → Descubrir → **swipe** (pasar uno, deslizar a la derecha en el de A) → Confirmar | "El swipe es sobre planes, nunca sobre personas. Antes de confirmar ves el plazo para cancelar y la consecuencia de faltar" |
| 5 | B | "¡Estás dentro!" con el recordatorio activo → "Saluda en el chat" → escribir | "El chat solo existe para quienes están en el plan" |
| 6 | C | Unirse al mismo plan → el mensaje de B aparece en tiempo real | Chat en vivo entre teléfonos |
| 7 | C | Perfil → Privacidad → "Quién ve mi perfil: Solo mis planes" | "Privacidad por diseño: el resto del campus te ve como 'Estudiante'" |
| 8 | A | Mis planes → Organizo → el plan → "Día del plan · validar asistencia" | — |
| 9 | B | Ir al evento → muestra su **código de 4 dígitos** | "La asistencia se valida en persona: es nuestra métrica principal" |
| 10 | A | Escribe el código de B → "¡B llegó!" → Terminar el plan | — |
| 11 | B | Calificar con estrellas | "Las calificaciones son a doble ciego: nadie ve la suya antes de tiempo" |
| 12 | — | Cerrar con la diapositiva de métricas (asistencias por semana, retención semana 4) | — |

## Si algo falla en vivo

| Problema | Salida rápida |
|---|---|
| No llega el código al correo | Usar una cuenta con la sesión ya abierta en otro teléfono; revisar spam |
| "Aún estamos revisando tu carné" | La cuenta no está aprobada: aprobarla desde el panel (30 s) |
| No deja crear el plan ("hasta 3 planes activos") | La cuenta tiene planes de demo: usar la cuenta A, que no está en el script |
| "Los códigos se validan desde 1 h antes" | El plan se creó para muy tarde: crear otro para dentro de 30–60 min |
| Sin internet | Cambiar al video de respaldo |
