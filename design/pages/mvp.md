# Pantallas del MVP · Junto

> Override de [DESIGN.md](../../DESIGN.md) para el MVP (Eventos, demo del 16 de noviembre de 2026). Para cada pantalla dice de dónde sale y qué cambia. La referencia visual de las pantallas existentes es el diseño de Claude Design ([../claude-design/junto-app.dc.html](../claude-design/junto-app.dc.html)); la de las pantallas nuevas es [../preview.html](../preview.html).
>
> Todas las pantallas usan los componentes y tokens de `DESIGN.md`. Ninguna lleva valores sueltos.

Leyenda: **=** igual al diseño (solo escala de texto nueva) · **Δ** cambia · **+** nueva

## 1. Mapa de pantallas

| Ruta (Expo Router) | Pantalla | Origen | Estado |
|---|---|---|---|
| `/(auth)/welcome` | Bienvenida | `splash` | = |
| `/(auth)/login` | Entrar con código | `login` | Δ |
| `/(auth)/register/email` | Registro 1/3 · correo y código | `register` | Δ |
| `/(auth)/register/verify` | Registro 2/3 · carné y fecha de nacimiento | `verify` | Δ |
| `/(auth)/register/profile` | Registro 3/3 · perfil e intereses | `profile` | = |
| `/(tabs)/home` | Pestaña Inicio | `home` | Δ |
| `/(tabs)/events` | Pestaña Eventos | `ev` | Δ |
| `/(tabs)/wheels` | Pestaña Wheels (Próximamente) | — | + |
| `/(tabs)/tours` | Pestaña Tours (Próximamente) | — | + |
| `/(tabs)/mine` | Pestaña Mis planes | `mine` | Δ |
| hoja | ¿Qué quieres crear? (desde Inicio) | — | + |
| `/events/create` | Crear plan | `create` | Δ |
| `/events/feed` | Feed con swipe | `feed` | = |
| `/plan/[id]` (hoja) | Detalle del plan | `detail` + hoja | = |
| `/plan/[id]/join` | Confirmar inscripción | `joinConfirm` | = |
| `/plan/[id]/full` | Plan lleno | `full` | = |
| `/plan/[id]/joined` | ¡Estás dentro! | `confirmed` | = |
| `/plan/[id]/chat` | Chat del plan | `chat` | Δ |
| `/plan/[id]/today` | Día del plan | `attend` | Δ |
| `/plan/[id]/rate` | Calificación | `rate` | Δ |
| `/plan/[id]/cancel` | Cancelar asistencia | `cancelEv` | = |
| `/plan/[id]/cancelled` | Asistencia cancelada | `cancelled` | = |
| `/plan/[id]/manage` | Plan publicado + solicitudes | `published` | = |
| `/plan/[id]/check-in` | Validar asistencia (organizador) | — | + |
| `/me` | Perfil | `me` | Δ |
| `/me/settings` | Ajustes | `settings` | Δ |
| `/me/privacy` | Privacidad y seguridad | `privacy` | Δ |
| `/me/blocked` | Usuarios bloqueados | — | + |
| `/report` | Reportar plan o persona | — | + |
| `/legal/[doc]` | Normas · Privacidad · Términos | — | + |
| — | Estados globales (§4) | — | + |

## 2. Cambios en pantallas existentes

### Entrar con código (`login`) — Δ
1. Cabecera con atrás. Logo 64. `h1` "Hola de nuevo". `body` "Te mandamos un código a tu correo de la U."
2. Campo **Correo**: `keyboardType="email-address"`, `autoComplete="email"`, `textContentType="emailAddress"`, placeholder "nombre@unbosque.edu.co".
3. Botón primario "Enviarme el código" → el campo de código aparece debajo (tarjeta), con el correo visible y "Cambiar".
4. **Código:** 6 casillas en `code` reducido (32 pt), `textContentType="oneTimeCode"`, `autoComplete="one-time-code"`, se puede pegar. "Reenviar en 0:42" → "Reenviar código".
5. Botón "Entrar" (deshabilitado hasta tener 6 dígitos; con 6 dígitos se envía solo).
6. Enlace "¿No tienes cuenta? **Regístrate**".

**Errores, junto al campo y con la causa y la solución:**
- *Dominio no permitido:* «Por ahora Junto es solo para la Universidad El Bosque. Usa tu correo @unbosque.edu.co.»
- *Código incorrecto:* «Ese código no coincide. Revisa el último correo que te enviamos.»
- *Código vencido:* «Ese código ya venció. Te mandamos uno nuevo.» (reenvío automático)
- *Demasiados intentos:* «Muchos intentos seguidos. Espera 10 minutos y vuelve a intentarlo.»
- La respuesta es **la misma** exista o no la cuenta: «Si el correo es de El Bosque, te llegará un código en un minuto.»

### Registro 1/3 · correo y código (`register`) — Δ
- Igual que el login, sin contraseña, con `h1` "Tu correo de la universidad" y `body` "Así sabemos que todos aquí son estudiantes."
- **Casilla obligatoria** antes de enviar el código: «Autorizo el tratamiento de mis datos según la [Política de datos] y acepto las [Normas de la comunidad].» Es una casilla de 24 con área de 48, y los enlaces abren `/legal/*`.
- Código de **6** dígitos (el diseño tenía 4).

### Registro 2/3 · carné (`verify`) — Δ
- Igual al diseño (zona de subida de 190, "Código estudiantil", aviso con candado).
- **+ Campo "Fecha de nacimiento"**: selector nativo de fecha y ayuda "Debes tener 18 años o más.". Si es menor: error junto al campo «Junto es para mayores de 18 años.» y el botón queda deshabilitado.
- La zona de subida ofrece **"Tomar foto"** (cámara) o **"Elegir archivo"** (galería o PDF), con la ayuda "JPG, PNG o PDF · máx. 10 MB".
- Aviso: «Solo lo usamos para validar tu identidad y lo borramos 30 días después de revisarlo. Revisión en menos de 24 h.»

### Navegación (todas las pestañas) — Δ (decisión del usuario, 2026-10-29)
- **Barra inferior de 5 pestañas:** Inicio · Eventos · Wheels · Tours · Mis planes (ver `bottom-nav` en `DESIGN.md`). Wheels y Tours son navegables aunque estén en "Próximamente".
- **Cabecera de las pestañas raíz:** a la izquierda el título; a la derecha el avatar, que abre Perfil.
- **Burbuja Crear:** círculo de 58 solo con "+", flotando encima de la barra, sobre la pestaña Mis planes (ver `create-fab` en `DESIGN.md`). Aparece en Inicio, Eventos, Wheels y Tours.
- **Qué hace Crear en cada pestaña:**

| Pestaña | Crear abre |
|---|---|
| Inicio | Hoja "¿Qué quieres crear?" con tres filas: **Evento** (activa) → Crear plan · **Ruta Wheels** y **Tour** con tag "Próximamente" → hoja Próximamente del módulo |
| Eventos | Crear plan (`/events/create`) |
| Wheels | Hoja "Pronto podrás publicar tu ruta" + "Avisarme cuando abra" |
| Tours | Hoja "Pronto podrás armar un viaje" + "Avisarme cuando abra" |

- Con el carné en revisión, Crear abre el aviso «Podrás crear planes cuando aprobemos tu carné» en lugar del formulario.

### Inicio (`home`) — Δ
- **Cabecera:** logo + "Universidad El Bosque · verificada" a la izquierda, avatar a la derecha. Burbuja "+" encima de la barra.
- **Wheels y Tours:** misma tarjeta de fila, con baldosa en `muted`, texto en `muted-foreground` y tag "Próximamente" en lugar del chevron. Al tocarla va a su pestaña.
- **Tarjeta de próximo plan** (lima): solo si el usuario tiene un plan; si no, ver §4 "Inicio sin planes".
- **Verificación pendiente o rechazada:** banner arriba (ver §4). Mientras está pendiente, "Eventos" lleva al feed en modo solo lectura.
- La etiqueta "Universidad El Bosque · verificada" solo aparece con el carné aprobado; si no, dice "Universidad El Bosque · en revisión".

### Pestaña Eventos (`ev`) — Δ
- Cabecera raíz: `h1-sm` "Eventos" + avatar. Burbuja "+" → Crear plan.
- Tarjeta grande lila **"Descubrir planes"** (icono `swipe`, «Desliza entre los planes de tu campus y únete en un toque.») → feed.
- **"Hoy en tu campus"** (`label`): hasta 3 filas de planes de hoy (baldosa de categoría + hora + título + tag de cupos) → detalle. "Ver todos" → feed.
- Si no hay planes hoy: el estado "Feed vacío" (§4) en una tarjeta.
- La bifurcación "¿Te unes o lo armas tú?" se quita: Crear ya está en la cabecera.

### Pestañas Wheels y Tours (Próximamente) — +
- Cabecera raíz: `h1-sm` "Wheels" / "Tours" + avatar. Burbuja "+" → hoja "Próximamente".
- Tarjeta protagonista con relleno del módulo (Wheels lime, Tours sky), icono xl e `h2`:
  - **Wheels:** «Carpooling a la U, entre estudiantes» · «Sube al carro de alguien de tu campus que pasa por tu ruta, o comparte tus puestos libres.»
  - **Tours:** «Viajes en grupo con gente de tu U» · «Arma un viaje con tu grupo o súmate a uno si no tienes con quién ir.»
- Tag "Próximamente". 3 filas con lo que traerá el módulo (icono + `title` + `small`), sacadas de `docs/03-producto/`.
- Toggle "Avisarme cuando abra" (guarda la preferencia; el push llega cuando el módulo abra).
- **Avisos en Inicio:** "4 rutas pasan cerca de ti" y "3 viajes abiertos este mes" se quitan: no hay datos reales.

### Crear plan (`create`) — Δ
- Pantalla interior (sin barra inferior), con atrás y `h1-sm` "Crear plan". Se abre desde Crear en Eventos o desde la hoja de Inicio.
- Sin el segmento Evento / Ruta Wheels.
- **Campos en orden:**
  1. **¿Qué van a hacer?** (título, máx. 60).
  2. **Categoría** (chips: Estudio · Deporte · Música · Cine · Comida · Fiesta · Voluntariado · Juegos · Arte · Naturaleza · Cultura). Define el icono y el color de la tarjeta.
  3. **Fecha** y **Hora** (selectores nativos, en una fila).
  4. **Lugar** (texto, máx. 80) + "Marcar en el mapa" (opcional).
  5. **Cupos** (stepper 2–50, default 10).
  6. **Cancelación gratis hasta** (segmentado: 1 h · 3 h · 24 h antes; default 3 h).
  7. **Quién puede unirse** (segmentado: Todo mi campus · Apruebo yo).
  8. **Descripción** (opcional, máx. 500, multilínea).
  9. **Foto** (opcional).
- El botón "Publicar plan" queda deshabilitado hasta tener título, categoría, fecha futura y lugar. Al tocarlo deshabilitado, se hace scroll al primer campo que falta y se le da foco.

### Chat (`chat`) — Δ
- **Mensaje fijado:** el organizador lo escribe; si no lo hace, se genera solo: «{hora} · {lugar}».
- **Respuestas rápidas:** «Voy en camino» · «¿Llevo algo?» · «Voy tarde».
- El campo crece hasta 4 líneas. El botón enviar tiene `accessibilityLabel` "Enviar mensaje".
- Mantener pulsado un mensaje ajeno abre "Reportar mensaje" o "Bloquear a {nombre}".
- "Ir al evento" solo aparece desde 2 h antes del plan.

### Día del plan (`attend`) — Δ
- **Mapa** real con un pin (react-native-maps) + "Abrir en Maps". Si no hay pin: tarjeta celeste con el lugar en texto.
- **Código de asistencia:** 4 dígitos con `code` tabular. Se lee dígito por dígito: `accessibilityLabel` "Tu código: 4, 9, 2, 1".
- "Ya llegué": marca la llegada y avisa en el chat.
- "Avisar que voy tarde": envía «{nombre} va un poco tarde» al chat y lo confirma con un aviso.

### Calificación (`rate`) — Δ
- Estrellas según `DESIGN.md` (vacía = contorno).
- Debajo de "Los asistentes": `small` «Tus calificaciones se publican cuando todos califiquen, o en 3 días.»
- "Enviar y ver más planes" sigue llevando al feed.

### Perfil, Ajustes, Privacidad — Δ
- **Perfil:** cifras "Planes", "Asistencias" y "★". Tag de verificación según el estado.
- **Ajustes:**
  - Apariencia (Oscuro · Claro · **Sistema**);
  - Notificaciones: solo "Recordatorios";
  - Cuenta: Universidad (fija) e Idioma (Español, fijo);
  - Cerrar sesión en `destructive-text`.
- **Privacidad y seguridad:**
  - Identidad verificada;
  - Quién ve mi perfil;
  - Mostrar carrera y semestre;
  - Usuarios bloqueados;
  - Reportar un problema;
  - Normas de la comunidad;
  - Política de datos;
  - Descargar mis datos;
  - **Contacto de seguridad** (chernandezmu@unbosque.edu.co, abre el correo);
  - Eliminar mi cuenta (`destructive-text`).

  Se quitan SOS, Ubicación, 2FA y Contacto de emergencia.

## 3. Pantallas nuevas

### Validar asistencia (organizador) — +
- Se abre desde "Día del plan" en la vista del organizador (el botón "Día del plan" de `published`).
- `h1` "¿Quién llegó?". `small` "Pídele a cada persona su código de 4 dígitos."
- Campo grande de 4 dígitos (`code` 40) + botón "Validar".
  - **Código correcto:** la persona pasa a "Llegó" (tag menta) con un `pop`.
  - **Código incorrecto:** «Ese código no es de este plan.»
  - **Tras 5 intentos fallidos:** «Muchos intentos. Espera un minuto.»
- Lista de inscritos (avatar + nombre + tag "Llegó" o "Pendiente"). Contador "6 de 9 llegaron".
- Botón "Terminar el plan" → habilita la calificación para todos.

### Usuarios bloqueados — +
- Lista de filas con avatar, nombre y botón secundario "Desbloquear".
- Vacío: «No has bloqueado a nadie. Si alguien te incomoda, puedes bloquearle desde su perfil o desde el chat.»

### Reportar — +
- `h1` "¿Qué pasó?".
- Chips de motivo:
  - Acoso o mensajes ofensivos;
  - Plan falso o engañoso;
  - Peligro para alguien;
  - Spam;
  - No es estudiante;
  - Otro.
- Campo "Cuéntanos más" (opcional, máx. 500).
- Botón "Enviar reporte" → estado final: «Recibimos tu reporte. Lo revisamos en menos de 24 h. {Nombre} no sabrá que fuiste tú.» Salidas: "Bloquear también" y "Volver".
- Si eligió "Peligro para alguien": tarjeta coral arriba con «Si estás en peligro ahora, llama al **123**.» y un botón para llamar.

### Legal — +
- Texto largo en `body` con un ancho de lectura máximo de 560, título `h1-sm` y "Última actualización".

## 4. Estados (vacío · carga · error)

Todos los estados siguen el **principio común**: qué pasó, qué significa y dos salidas, una de ellas dentro del producto. Usan `status-screen` (icono de 96 en relleno + `h1` + `body` + botones) o, dentro de una pantalla, una tarjeta.

| Estado | Dónde | Icono · relleno | Título | Texto | Salidas |
|---|---|---|---|---|---|
| Carné en revisión | Banner en Inicio | `hourglass_top` · sky | Estamos revisando tu carné | Tarda menos de 24 h. Mientras tanto puedes mirar los planes, pero aún no unirte ni crear. | "Ver planes" · (cerrar) |
| Carné rechazado | Pantalla al entrar | `badge` · peach | No pudimos validar tu carné | {motivo: "La foto está borrosa" / "No está vigente" / "No coincide con tu nombre"}. Súbelo de nuevo y lo revisamos otra vez. | "Subir de nuevo" · "Escribir a soporte" |
| Menor de edad | Registro 2/3 | `person_off` · peach | Junto es para mayores de 18 | Cuando cumplas 18 te esperamos. Borramos los datos que enviaste. | "Entendido" |
| Feed vacío | Feed | `event_available` · lilac | Todavía no hay planes hoy | Sé la primera persona en armar uno: los planes nuevos le aparecen a todo tu campus. | "Crear un plan" · "Avisarme cuando haya" |
| Fin del feed | Feed | `done_all` · mint | Viste todos los planes de hoy | Vuelve más tarde o arma el tuyo. | "Crear un plan" · "Ver de nuevo" |
| Inicio sin planes | Tarjeta en Inicio (en lugar de la lima) | `explore` · lilac | Aún no tienes planes | Hay {n} planes en tu campus hoy. | "Descubrir planes" |
| Mis planes vacío | Cada pestaña | `event_note` · muted | Próximos: «No tienes planes próximos» · Organizo: «No has creado planes» · Pasados: «Aquí verás los planes a los que fuiste» | — | "Descubrir planes" / "Crear un plan" |
| Chat vacío | Chat | — | — | Burbuja del sistema: «Eres de los primeros. Saluda y rompe el hielo 👋» (es contenido, no icono) | Respuestas rápidas |
| Sin solicitudes | Plan publicado | — | — | `small`: «Todavía no hay solicitudes. Te avisamos cuando alguien quiera unirse.» | — |
| Plan cancelado por el organizador | Pantalla al abrir el plan | `event_busy` · coral | {Organizador} canceló el plan | {Título} ya no va. Saliste del chat y no afecta tu calificación. | "Ver otros planes" · "Volver al inicio" |
| Carga | Feed, listas, detalle | — | — | Esqueletos con la forma del contenido (tarjeta, filas) en `muted`, sin animación de brillo con movimiento reducido. Nunca un spinner de pantalla completa más de 300 ms | — |
| Sin conexión | Banner superior en cualquier pantalla | `cloud_off` · peach | Sin conexión | Lo que ves puede no estar al día. Reintentamos solos. | "Reintentar" |
| Error al enviar | Junto al botón o al mensaje | `error` · coral (tarjeta) | No se pudo {acción} | {causa si se sabe}. Tus datos siguen aquí. | "Reintentar" |
| Error general | Pantalla | `sentiment_dissatisfied` · coral | Algo salió mal | No es tu culpa. Ya quedó registrado. | "Reintentar" · "Volver al inicio" |
| Ruta no encontrada | Pantalla (enlace roto) | `link_off` · peach | Este enlace no lleva a ningún lado | Puede que el plan se haya borrado. | "Volver al inicio" |

## 5. Iconos por concepto (Material Symbols Rounded, relleno)

| Concepto | Icono | Concepto | Icono |
|---|---|---|---|
| Eventos | `celebration` | Estudio | `menu_book` |
| Wheels | `directions_car` | Deporte | `sports_soccer` |
| Tours | `landscape` | Música | `music_note` |
| Verificado | `verified` / `verified_user` | Cine | `movie` |
| Hora | `schedule` | Comida | `restaurant` |
| Lugar | `location_on` | Fiesta | `nightlife` |
| Cupos | `event_seat` | Voluntariado | `volunteer_activism` |
| Plazo | `timer` / `lock_clock` | Juegos | `sports_esports` |
| Chat | `chat` / `forum` | Arte | `palette` |
| Recordatorio | `alarm` | Naturaleza | `park` |
| Mensaje fijado | `push_pin` | Cultura | `theater_comedy` |
| Llegué | `where_to_vote` | Swipe | `swipe` |
| Filtros | `tune` | Crear | `add` / `add_circle` |
| Inicio (pestaña) | `home` | Mis planes (pestaña) | `event_note` |
| Reportar | `flag` (en la UI) / `report` (en ajustes) | Bloquear | `block` |

## 6. Accesibilidad específica

- **Feed:**
  - la tarjeta es un botón: "Plan: {título}, {cuándo}, {lugar}, {cupos}. Toca para ver detalles";
  - acciones personalizadas del lector de pantalla: "Pasar" y "Me interesa";
  - posición anunciada: "1 de 12".
- **Código de 6 dígitos:** un solo `TextInput` real (no 6 campos sueltos). Las casillas son visuales y se puede pegar el código completo.
- **Toggles:** la fila entera tiene `accessibilityRole="switch"` y `accessibilityState={{ checked }}`.
- **Estrellas:** `accessibilityRole="adjustable"`, con valor "4 de 5" e incremento y decremento.
- **Foco:** al cambiar de pantalla va al `h1`; en una hoja inferior, a su título; al cerrarla, vuelve a la tarjeta que la abrió.
- **Errores de formulario:** si hay más de uno, tarjeta resumen arriba enlazada a los campos, y foco en ella al enviar.
