---
# DESIGN.md · Junto
# Fuente de verdad visual de la app. Sale del diseño de Claude Design ("Junto App", copia en design/claude-design/)
# con las correcciones de contraste, tamaño de texto y alcance del MVP descritas abajo.
# Nombres de tokens estilo shadcn (aunque la app es React Native y no usa shadcn): así el mismo archivo
# sirve para el panel web interno (P1) y para volver a Claude Design.
identity: hybrid                # look propio de Claude Design + tokens semánticos de product-shadcn + reglas nativas
style: neobrutalista-suave      # bordes de 2 px, sombras duras sin desenfoque, píldoras, rellenos pastel
dials: { variance: 6, motion: 6, density: 5 }
default-theme: dark

colors:
  dark:
    background: "#16141d"          # fondo de pantalla
    foreground: "#f3f0fa"          # texto principal · 16,2:1 sobre background
    card: "#211e2b"                # superficies: tarjetas, campos, barra inferior, botón secundario
    card-foreground: "#f3f0fa"
    popover: "#16141d"             # hojas inferiores (sheet) usan el fondo, con borde superior
    popover-foreground: "#f3f0fa"
    muted: "#2c2839"               # superficie 2: carga, zona de subida vacía, toggle apagado
    muted-foreground: "#aaa4bd"    # texto secundario · 7,6:1 sobre background · 6,8:1 sobre card · 6,0:1 sobre muted
    primary: "#f3f0fa"             # botón primario = tinta invertida (píldora clara con texto oscuro)
    primary-foreground: "#16141d"
    secondary: "#211e2b"           # botón secundario = superficie con borde
    secondary-foreground: "#f3f0fa"
    accent: "#e4f47c"              # lima de marca: CTA de bienvenida, botón Crear, plan destacado
    accent-foreground: "#16141d"   # 15,2:1
    border: "#e6e1f2"              # bordes de 2 px · 14,3:1 (se ven como contorno claro)
    input: "#e6e1f2"
    ring: "#e4f47c"                # foco visible (teclado externo, lector de pantalla)
    shadow: "#5a5180"              # sombra dura desplazada; decorativa, nunca lleva información
    destructive: "#ff8a8a"         # relleno de acciones destructivas, con texto on-fill
    destructive-foreground: "#16141d"
    destructive-text: "#ff8a8a"    # texto/icono de error o peligro · 7,2:1 sobre card
    star: "#f7c99a"                # estrella llena · 10,7:1 sobre card
    scrim: "rgba(10, 8, 16, 0.6)"  # fondo detrás de hojas y diálogos
  light:
    background: "#f7f4ee"
    foreground: "#1c1631"          # 15,8:1
    card: "#fffdf9"
    card-foreground: "#1c1631"
    popover: "#f7f4ee"
    popover-foreground: "#1c1631"
    muted: "#eee9e0"
    muted-foreground: "#5d5770"    # 6,3:1 sobre background · 6,8:1 sobre card · 5,7:1 sobre muted
    primary: "#1c1631"
    primary-foreground: "#f7f4ee"
    secondary: "#fffdf9"
    secondary-foreground: "#1c1631"
    accent: "#e4f47c"              # SOLO como relleno con texto on-fill (como texto da 1,09:1)
    accent-foreground: "#16141d"
    border: "#1c1631"              # contorno oscuro · 15,8:1
    input: "#1c1631"
    ring: "#1c1631"
    shadow: "#1c1631"
    destructive: "#ff8a8a"         # SOLO como relleno (como texto da 2,2:1)
    destructive-foreground: "#16141d"
    destructive-text: "#b3261e"    # corregido · 6,4:1 sobre card (el prototipo usaba #ff8a8a = 2,2:1)
    star: "#b8651c"                # corregido · 4,2:1 sobre card (el durazno daba 1,5:1)
    scrim: "rgba(28, 22, 49, 0.5)"

  # Rellenos pastel: iguales en los dos temas. Siempre con texto e iconos on-fill (#16141d).
  fills:
    on-fill: "#16141d"
    lilac: "#c9b8ff"   # 10,2:1 · Eventos, chip seleccionado, mi burbuja de chat
    lime:  "#e4f47c"   # 15,2:1 · marca, plan destacado, Wheels
    sky:   "#a7d6f6"   # 11,8:1 · Tours, info, mapa
    mint:  "#a6e8cc"   # 13,0:1 · éxito, verificado, cupos disponibles, toggle encendido
    peach: "#f7c99a"   # 12,0:1 · aviso, plan lleno, avatar por defecto
    coral: "#ff8a8a"   #  8,0:1 · peligro, cancelar, lleno

  semantic:
    success: mint
    warning: peach
    danger: coral
    info: sky
    module: { eventos: lilac, wheels: lime, tours: sky }
    category: { estudio: lilac, deporte: lime, cine: sky, cultura: sky, comida: peach, musica: lilac, fiesta: coral, voluntariado: mint, juegos: peach, arte: lilac, naturaleza: mint }

typography:
  families:
    display: { name: "Bricolage Grotesque", weights: [800], source: "@expo-google-fonts/bricolage-grotesque", note: "solo títulos y cifras grandes" }
    sans:    { name: "Lexend", weights: [400, 500, 600, 700], source: "@expo-google-fonts/lexend" }
    icons:   { name: "Material Symbols Rounded", style: "FILL 1, peso 500", note: "ver Known gaps: implementación en RN" }
  scale:   # tamaños en pt (React Native). letterSpacing en pt = em × tamaño.
    display:  { family: display, size: 46, line-height: 52, tracking: -1.6, note: "solo bienvenida" }
    h1:       { family: display, size: 34, line-height: 35, tracking: -0.7 }
    h1-sm:    { family: display, size: 30, line-height: 32, tracking: -0.6, note: "títulos de pestaña: Eventos, Wheels, Tours, Mis planes; Crear plan; título del detalle" }
    h2:       { family: display, size: 24, line-height: 26, tracking: -0.24 }
    stat:     { family: display, size: 24, line-height: 26, note: "cifras del perfil, cupos" }
    code:     { family: display, size: 52, line-height: 56, tracking: 9, note: "código de asistencia; tabular" }
    title:    { family: sans, weight: 600, size: 17, line-height: 21 }
    body:     { family: sans, weight: 400, size: 16, line-height: 23, note: "el prototipo usaba 15" }
    small:    { family: sans, weight: 400, size: 14, line-height: 20, note: "metadatos; mínimo para texto que se lee. El prototipo usaba 12–13" }
    label:    { family: sans, weight: 600, size: 12, line-height: 14, tracking: 1, transform: uppercase, note: "mínimo absoluto; el prototipo usaba 10–11" }
    button:   { family: sans, weight: 600, size: 16, line-height: 20 }
    button-lg:{ family: sans, weight: 600, size: 17, line-height: 22 }
    chip:     { family: sans, weight: 500, size: 14, line-height: 18 }
    tag:      { family: sans, weight: 600, size: 13, line-height: 16 }
    nav:      { family: sans, weight: 600, size: 12, line-height: 14, note: "sin mayúsculas ni tracking: con 5 pestañas 'Mis planes' tiene que caber en ~70 pt; maxFontSizeMultiplier 1.3" }
  dynamic-type: "allowFontScaling activo en todo; maxFontSizeMultiplier 1.4 en display/h1/code, 2 en el resto"

rounded:
  sm: 12      # baldosa del logo pequeño, avisos compactos
  md: 16      # campos de texto, media (foto/mapa), tarjetas compactas
  lg: 20      # tarjetas
  sheet: 28   # esquinas superiores de la hoja inferior
  bubble: { mine: "18 18 4 18", theirs: "18 18 18 4" }
  pill: 999   # botones, chips, tags, toggles, botones de icono, avatares, barra de progreso

border: { width: 2, color: border }

spacing: { base: 4, scale: [4, 8, 12, 16, 20, 24, 32, 48] }
layout:
  screen-padding-x: 20
  screen-padding-bottom: 28        # + safe area
  section-gap: 16
  card-padding: 16                  # 12 en tarjetas de lista
  card-gap: 12                      # el prototipo usa 10
  inline-gap: 8
  max-content-width: 560            # tablets: contenido centrado

elevation:   # sombras duras: desplazamiento sin desenfoque, color shadow. RN ≥ 0.76 (new arch): style.boxShadow
  none: "none"
  sm: "2px 2px 0 {shadow}"          # chips seleccionados, botón atrás, logo pequeño
  md: "3px 3px 0 {shadow}"          # botones, campo con foco, avatar grande
  lg: "4px 4px 0 {shadow}"          # tarjetas
  pressed: "1px 1px 0 {shadow}"     # + translate(2, 2) mientras se presiona

controls:
  button-height: 52                 # padding vertical 15 + texto 16 + borde
  button-lg-height: 56
  field-height: 52
  icon-button: 44                   # hitSlop 4 → 52 de área táctil (≥ 48 dp Android)
  icon-button-lg: 64                # ✕ y ✓ del feed
  create-fab: 58                    # burbuja "+" flotante sobre la pestaña Mis planes (icono 30)
  tab-indicator: { width: 56, height: 32 }   # píldora detrás del icono de la pestaña activa
  tab-bar-height: 64                # + safe area inferior
  icon-tile: 52                     # baldosa de icono de módulo / lista
  status-icon: 96                   # icono de estado final
  avatar: { sm: 34, md: 44, lg: 76, xl: 84 }
  toggle: { width: 50, height: 30, note: "toda la fila es el control (área ≥ 48)" }
  icon-size: { sm: 18, md: 24, lg: 32, xl: 44 }

focus: { type: ring, color: ring, width: 2, offset: 2 }

motion:
  easing:
    press: "linear"
    out: "cubic-bezier(.2, .8, .2, 1)"
    bounce: "cubic-bezier(.2, .9, .25, 1.15)"   # entrada con rebote leve (firma del prototipo)
    pop: "cubic-bezier(.3, 1.5, .5, 1)"          # chips, avatares, iconos de estado
    sheet: "cubic-bezier(.2, .9, .3, 1.1)"
  duration: { press: 80, micro: 150, state: 200, enter: 550, pop: 450, sheet: 450, swipe: 600, exit: 250 }
  stagger: { step: 50, max: 500 }
  reduced-motion: "sin entradas escalonadas, sin bucles (marquesina, giro, flotar, vaivén, pulso), swipe que se asienta sin rebote; solo fundidos de 150 ms"

components:
  button-primary:   "relleno primary, texto primary-foreground, borde 2 border, píldora, elevation.md, alto 52; presionado: translate(2,2) + elevation.pressed"
  button-accent:    "igual que primary con relleno accent (lima) y texto on-fill: solo 'Crear cuenta con mi correo U'"
  button-success:   "relleno mint + on-fill: solo 'Sí, confirmar mi cupo'"
  button-danger:    "relleno coral + on-fill: solo 'Sí, cancelar mi asistencia' / 'Cancelar asistencia'"
  button-secondary: "relleno secondary, texto foreground, borde 2, píldora, elevation.md, alto 48"
  button-link:      "texto muted-foreground subrayado, 14; área táctil ≥ 44"
  button-disabled:  "opacidad 0.35, accessibilityState.disabled, sin onPress"
  icon-button:      "44 × 44, píldora, card + borde 2 + elevation.sm; accessibilityLabel obligatorio"
  card:             "card, borde 2 border, radio lg, elevation.lg, padding 16, gap 12"
  card-fill:        "card con relleno pastel y texto on-fill; borde y sombra #16141d si va sobre fondo (tarjetas protagonistas)"
  field:            "card, borde 2 input, radio md, alto 52, texto body; foco: elevation.md; error: borde destructive-text + mensaje debajo"
  chip:             "transparente, borde 2, píldora, 14; seleccionado: relleno lilac + on-fill + elevation.sm; accessibilityState.selected"
  tag:              "píldora con relleno pastel + on-fill, borde 2, 13 semibold (cupos, estados)"
  segmented:        "contenedor card con borde 2, píldora, padding 3; opción activa relleno primary + primary-foreground"
  toggle:           "50 × 30; apagado muted, encendido mint con perilla on-fill; toda la fila con accessibilityRole switch"
  avatar:           "círculo con borde 2, relleno pastel, inicial en display 800; foto si existe; apilados con -8 de solapamiento y '+N'"
  verified-badge:   "tag mint 'Estudiante verificada/o' o icono verified"
  seats-tag:        "tag mint 'N cupos' / coral 'Lleno'"
  media:            "radio md, borde 2, foto del plan o relleno de categoría con icono xl flotando"
  bottom-nav:       "card con borde superior 2; 5 pestañas: Inicio (home) · Eventos (celebration) · Wheels (directions_car) · Tours (landscape) · Mis planes (event_note). Activa: icono dentro de tab-indicator con borde 2 y relleno del módulo (Eventos lilac, Wheels lime, Tours sky; Inicio y Mis planes primary con icono primary-foreground) + etiqueta en foreground. Inactiva: icono y etiqueta muted-foreground. accessibilityRole tab + selected"
  create-fab:       "burbuja circular de 58, SOLO el icono add (30), sin texto; relleno primary + primary-foreground (como el '+' del diseño original), borde 2, elevation.md; presionado: translate(2,2) + elevation.pressed. Posición: flota encima de la barra inferior, centrada horizontalmente sobre la pestaña Mis planes, a 16 del borde superior de la barra. accessibilityLabel 'Crear', accessibilityHint según la pestaña ('Crear un evento', 'Elegir qué crear'…). Visible en Inicio, Eventos, Wheels y Tours; no en Mis planes ni en pantallas interiores. Entra con 'pop' al cambiar de pestaña"
  root-header:      "pestañas raíz: título h1-sm (o logo + universidad en Inicio) a la izquierda; avatar (abre Perfil) a la derecha"
  header:           "pantallas interiores: icon-button atrás · título (title o label o tag) · acción o hueco de 44"
  sheet:            "popover, borde superior 2, radio sheet arriba, asa 48 × 5 muted-foreground, máx. 84% del alto, scrim"
  chat-bubble:      "borde 2, 14→16 de texto; ajenos: card con radio theirs; míos: lilac + on-fill con radio mine; nombre encima en label"
  pinned-message:   "card-fill lime con icono push_pin"
  stars:            "5 iconos de 40 con área 48; llena: color star; vacía: icono de contorno en muted-foreground; accesible como ajustable (1–5)"
  stepper:          "valor stat + dos icon-button − / +; accessibilityRole adjustable"
  status-screen:    "icono de estado 96 en relleno pastel + h1 + qué pasó (body) + dos salidas"
---

# Junto · Sistema de diseño

## Overview
Junto se siente **como un tablero de corcho del campus**: tarjetas de colores con contorno marcado y sombra dura, que parecen recortadas y pegadas, sobre un fondo violeta casi negro. Es cercano y con energía, sin parecer infantil ni de app de citas. La confianza la ponen las insignias de verificación y los textos que explican las consecuencias antes de actuar.

Base: el diseño de Claude Design "Junto App" ([design/claude-design/junto-app.dc.html](design/claude-design/junto-app.dc.html)). Lo que este archivo cambia respecto a ese diseño está en **Cambios respecto a Claude Design**, y las pantallas nuevas en [design/pages/mvp.md](design/pages/mvp.md).

## Colors

**Cómo se usan:**
- La interfaz es **tinta sobre fondo**: los botones primarios invierten fondo y texto (píldora clara en oscuro, oscura en claro).
- El color va en **rellenos pastel** con texto siempre `#16141d`. Cada relleno tiene un significado fijo:
  - lila: Eventos, selección, mis mensajes;
  - lima: marca y lo destacado;
  - menta: éxito, verificado, cupos disponibles;
  - durazno: aviso;
  - coral: peligro, lleno, cancelar;
  - celeste: información y mapa.
- **El lima no es el botón por defecto.** Se reserva para lo más importante de la pantalla, como máximo una vez.
- **El color nunca va solo:** "Lleno" lleva texto, "Verificada" lleva texto o icono y los estados de solicitud dicen "Aceptado" o "Rechazado".

**Pares de contraste comprobados** (WCAG; texto ≥ 4,5:1, iconos y bordes ≥ 3:1):

| Par | Oscuro | Claro |
|---|---|---|
| foreground / background | 16,2 | 15,8 |
| muted-foreground / background | 7,6 | 6,3 |
| muted-foreground / card | 6,8 | 6,8 |
| muted-foreground / muted | 6,0 | 5,7 |
| primary-foreground / primary | 16,2 | 15,8 |
| border / background | 14,3 | 15,8 |
| on-fill / lilac · lime · sky · mint · peach · coral | 10,2 · 15,2 · 11,8 · 13,0 · 12,0 · 8,0 | igual |
| destructive-text / card | 7,2 | 6,4 (corregido) |
| star / card | 10,7 | 4,2 (corregido) |
| estrella vacía (muted-foreground) / card | 6,8 | 6,8 (corregido) |
| shadow / background | 2,5 | 15,8 · decorativa, no transmite información |

**No usar nunca:** lima, coral o cualquier pastel como color de **texto o icono** sobre fondo claro. Hex sueltos en componentes: todo sale de `theme.colors`.

## Typography

- **Bricolage Grotesque 800** solo para títulos (`display`, `h1`, `h2`), cifras (`stat`) y el código de asistencia. Siempre en 800, con tracking negativo solo desde 24 pt.
- **Lexend** para todo lo demás. El cuerpo es de **16 pt**; el prototipo usaba 15, y Lexend es ancha pero sigue cómoda a 16.
- **Mínimos:** 14 para texto que hay que leer y 12 solo para etiquetas en mayúsculas. Nada de 10–11 como en el prototipo.
- Los títulos de bifurcación son **preguntas** ("¿Te unes o lo armas tú?").
- **Cifras:** `fontVariant: ['tabular-nums']` en el código de asistencia, los cupos, los contadores y la hora.
- **Tamaño de letra del sistema:** se respeta. Con 200 % los layouts de fila pasan a columna y nada se corta: las tarjetas crecen en alto y no hay alturas fijas en las que haya texto.

## Layout

- **Móvil primero:** de 375 a 430 pt de ancho. En tablet el contenido se centra a 560 de ancho máximo.
- **Pantalla:** margen horizontal de 20, separación vertical de 16 entre bloques y botón de acción abajo, empujado por un espaciador flexible.
- **Zonas seguras:** respetadas arriba y abajo (`react-native-safe-area-context`). La barra inferior suma el inset inferior a su alto de 64.
- **Ritmo:** múltiplos de 4. El prototipo usa 10, 6 y 14 en algunos sitios: se normalizan a 8 o 12 y a 16.
- **Barra inferior:** 5 pestañas (Inicio · Eventos · Wheels · Tours · Mis planes), visible solo en esas 5 pantallas raíz. Las pantallas interiores (feed, detalle, chat, crear plan…) la ocultan, usan la flecha atrás, y las confirmaciones y estados finales usan botones explícitos. Volver a tocar la pestaña activa sube al inicio de su lista.
- **Crear:** no está dentro de la barra. Es una **burbuja "+"** (58, color tinta, `primary`) que flota encima de la barra, justo sobre la pestaña Mis planes, en Inicio, Eventos, Wheels y Tours. Las listas de esas pantallas llevan 90 de margen inferior extra para que la burbuja no tape el último elemento. En Inicio abre la hoja "¿Qué quieres crear?" (Evento · Ruta Wheels · Tour), en Eventos abre "Crear plan" y en Wheels y Tours abre la hoja "Próximamente" mientras esos módulos no estén.
- **Áreas táctiles:** ≥ 44 pt en iOS y ≥ 48 dp en Android. Los botones de icono de 44 llevan `hitSlop` de 4. Los chips (≈ 38 de alto) llevan `hitSlop` vertical. En los toggles, toda la fila es tocable.

## Motion

El movimiento es parte de la marca: las cosas **caen y rebotan un poco**, como tarjetas que se pegan en un tablero. Se implementa con `react-native-reanimated`, que viene incluido en Expo Go.

| Qué | Cómo | Duración |
|---|---|---|
| Entrada de pantalla | Cada bloque sube 26 y aparece, escalonado 50 ms (tope 500 ms), easing `bounce` | 550 ms |
| Cabecera | Baja 18 y aparece | 550 ms |
| Chips, tags, avatares | Aparecen con escala 0.4 → 1.12 → 1 (`pop`) | 450 ms |
| Burbujas de chat | Las ajenas entran desde la izquierda y las mías desde la derecha (40) | 450 ms |
| Hoja inferior | Sube desde abajo; el scrim aparece en 300 ms | 450 ms |
| Swipe del feed | Sigue el dedo con rotación proporcional (máx. ±14°). Al soltar pasado el umbral sale volando; si no, vuelve con resorte. La siguiente entra desde la derecha rotada 14° | 600 ms |
| Presionar | translate(2, 2) y la sombra baja a 1 px; al soltar vuelve | 80 ms |
| Icono de estado final | Escala 0 → 1.2 → 1 con giro −25° → 8° → 0 | 800 ms |
| Racha (fase 2) | Vaivén del icono de fuego | 1,2 s en bucle |

**Protagonista por pantalla:**
- **Bienvenida:** la caída de las tarjetas. La marquesina, el giro y el pulso son de fondo.
- **Feed:** el swipe.
- **Estados finales:** el icono.

**Movimiento reducido** (`useReducedMotion` de Reanimated / `AccessibilityInfo.isReduceMotionEnabled`):
- sin entradas escalonadas ni rebotes;
- sin bucles: la marquesina queda quieta, sin giro, sin flotar, sin pulso;
- el swipe sigue funcionando, pero la tarjeta sale y entra con un fundido de 150 ms.

**Bucles:** solo en la bienvenida (marquesina, círculo punteado que gira, tarjetas que flotan, punto "online" que late), y se detienen al salir de la pantalla. Ninguna animación bloquea un toque.

## Do's
- Una sola acción principal por pantalla, abajo. Si hay una secundaria, va debajo como `button-secondary`.
- Explicar la consecuencia **antes** de comprometer al usuario (cupos, plazo de cancelación, efecto en la calificación).
- Los estados límite siguen el principio común del producto:
  - dicen qué pasó;
  - dicen qué significa;
  - ofrecen dos salidas, una de las cuales mantiene al usuario dentro de la app.
- El swipe siempre tiene **botones equivalentes** (✕ pasar, ✓ me interesa) y tocar la tarjeta abre el detalle. Nadie depende del gesto.
- Los botones de icono llevan `accessibilityLabel` en español ("Volver", "Compartir plan", "Guardar plan", "Filtros", "Enviar mensaje").
- Los iconos decorativos junto a un texto van fuera del árbol de accesibilidad (`accessibilityElementsHidden` / `importantForAccessibility="no"`).
- Fotos de los planes con `expo-image`, con placeholder de color de categoría y espacio reservado (sin saltos).
- Copia en segunda persona informal y en español de Colombia ("parche", "plan", "tu U").

## Don'ts
- Colores crudos en componentes o `if (dark)` por pantalla: todo pasa por `useTheme()`.
- Sombras con desenfoque o `elevation` de Android: aquí las sombras son **duras**.
- Mezclar iconos rellenos y de contorno en el mismo nivel. Todo va relleno, salvo la estrella vacía, que es contorno a propósito.
- Emojis como iconos de interfaz (en los mensajes del chat sí, son del usuario).
- Swipe sobre personas, fotos de personas grandes en tarjetas o cualquier cosa que lea como app de citas.
- Texto sobre fotos sin capa de contraste.
- Más de una tarjeta con relleno lima en la misma pantalla.
- Animar ancho o alto, o usar una sola duración para todo.

## Cambios respecto a Claude Design

| # | En el diseño | En el MVP | Por qué |
|---|---|---|---|
| 1 | Login con correo + contraseña (mín. 4 caracteres) | Correo → código de 6 dígitos al correo; sin contraseña | Decisión de E0 (seguridad) |
| 2 | Registro paso 1: correo + contraseña + código de 4 | Correo + código de 6 + casilla de autorización de datos (Ley 1581) con enlace a la política | Decisión de E0 + legal |
| 3 | Registro paso 2: carné + código estudiantil | + fecha de nacimiento (18+) | Decisión de E0 |
| 4 | Inicio: Wheels y Tours navegables | Tarjetas con tag "Próximamente" que llevan a la pestaña de Wheels o Tours (pantalla "Próximamente") | Alcance MVP |
| 5 | Crear: segmento Evento / Ruta Wheels, como pestaña | Pantalla interior "Crear plan", solo Evento. + categoría (chips), descripción opcional, foto opcional, plazo de cancelación (default 3 h antes) | Alcance MVP + reglas de producto |
| 5b | Barra inferior de 3: Inicio · Crear (botón central) · Mis planes | Barra de 5: Inicio · Eventos · Wheels · Tours · Mis planes. "Crear" pasa a una burbuja "+" flotante sobre la pestaña Mis planes, en Inicio, Eventos, Wheels y Tours | **Decisión del usuario** (2026-10-29) |
| 5c | Entrada a Eventos: bifurcación "¿Te unes o lo armas tú?" | La pestaña Eventos abre con el título "Eventos", la tarjeta grande "Descubrir planes" (swipe) y la lista "Hoy en tu campus". Crear está en la cabecera | Evita duplicar el botón Crear |
| 6 | Privacidad: SOS, ubicación en viajes, 2FA, contacto de emergencia | Ocultos (son de Wheels/Tours o redundantes con el código por correo). + "Contacto de seguridad" | Alcance MVP |
| 7 | Perfil: Planes · Viajes · ★ | Planes · Asistencias · ★ | Sin Wheels en el MVP |
| 8 | Mis planes: ítems de Wheels y Tours, racha | Solo eventos; la racha pasa a la fase 2 | Alcance MVP |
| 9 | Ajustes: "Planes nuevos en mi campus", idioma | Solo "Recordatorios"; idioma fijo en Español (no tocable) | Alcance de notificaciones del 16 de nov. |
| 10 | Texto de 10–15 pt | Escala nueva: cuerpo 16, mínimo 14 / 12 | Accesibilidad |
| 11 | Estrellas vacías en `--sf2` (1,1:1) y llenas en durazno en claro (1,5:1) | Vacía en contorno `muted-foreground`, llena en `star` | Contraste |
| 12 | "Eliminar mi cuenta" y "Cerrar sesión" en coral también en claro (2,2:1) | `destructive-text` | Contraste |
| 13 | El organizador no tiene pantalla para validar códigos | Pantalla nueva "Validar asistencia" | Regla 07 (asistencia verificada) |
| 14 | "Avisar que voy tarde" sin efecto | Envía un mensaje predefinido al chat del plan | Completar flujo |
| 15 | Calificación de asistentes con 👍 | Se mantiene, + aviso de doble ciego ("Se publica cuando todos califiquen") | Regla 06 |

**Gesto del feed:** la documentación dice "swipe a la derecha abre el detalle". El diseño hace: tocar la tarjeta abre el detalle (hoja) y ✓ / swipe a la derecha va a "Confirmar inscripción". **Se sigue el diseño.** La confirmación ya muestra la información clave y pide confirmar, así que no hay inscripción accidental.

## Pages (overrides)
Pantallas nuevas, estados y copy del MVP: [design/pages/mvp.md](design/pages/mvp.md). Lo que diga ese archivo sobre una pantalla manda sobre este.

Vista previa visual de tokens, componentes y pantallas nuevas: [design/preview.html](design/preview.html) (abrir en el navegador).

## Known gaps
- **Iconos en React Native:** Material Symbols Rounded es una fuente variable (relleno y peso como ejes), y React Native no controla esos ejes. En E2 se usa el paquete de SVG oficial `@material-symbols/svg-500` (variantes `rounded` y `-fill`) con `react-native-svg`, que viene en Expo Go, a través de un componente `<Icon name="…" />` con solo los iconos usados. Así funciona en Expo Go sin módulos nativos.
- **Sombras duras:** se usan con `style.boxShadow` (React Native 0.76+, nueva arquitectura, incluida en Expo Go). Si una versión de Android no la dibuja, el plan B es una `View` desplazada detrás.
- **Mapa del punto de encuentro:** el diseño pone un marcador de posición. En E2 se usa `react-native-maps` (incluido en Expo Go) con un pin y un botón "Abrir en Maps". Sin seguimiento de ubicación.
- **Wordmark "junto":** solo existe como PNG (844 × 366). Sirve para la bienvenida (con `tintColor` = foreground), pero para tiendas y splash conviene un SVG (P1).
- **Ícono de la app:** el PNG es de 400 × 400. Para el APK se escala a 1024; para las tiendas (P1) hace falta un original más grande o vectorial.
- **Iconos de categoría:** el diseño solo define estudio (`menu_book`), deporte (`sports_soccer`), cine (`movie`) y ping-pong. El resto se asigna en `design/pages/mvp.md`.
- **Modo claro:** existe en el diseño, pero el prototipo casi no lo mostró. Lo derivado (estrella, destructive-text, scrim) está marcado como "corregido".
