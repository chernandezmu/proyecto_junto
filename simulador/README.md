# Simulador web de Junto

Una página web que imita la app Junto pantalla por pantalla, para que cualquiera la pruebe desde un link, sin instalar Expo Go ni tener cuenta `@unbosque.edu.co`.

- **En el computador** se ve un teléfono en el centro y, a la izquierda, un menú con todos los apartados de la app.
- **En el celular** la app ocupa toda la pantalla, como si estuviera instalada. Para saltar entre apartados se toca la **pestaña verde del borde izquierdo**.

Todo se puede tocar: deslizar planes, unirse, escribir en el chat, crear un plan, validar códigos, cambiar el tema… Los datos son de ejemplo y **no se conecta a Supabase**: nada se guarda ni se envía.

## Qué hay en esta carpeta

```
simulador/
  index.html      el simulador completo (HTML + CSS + JS, sin dependencias ni build)
  assets/         ícono y logotipo (copiados de mobile/assets/images)
  manifest.json   permite "Añadir a pantalla de inicio" en el celular
  vercel.json     configuración del sitio en Vercel
  README.md       este archivo
```

---

## Paso 1 · Verlo en tu computador (opcional)

**Opción rápida:** abre `simulador/index.html` con doble clic. Se abre en el navegador y funciona.

**Opción igual a Vercel** (recomendada antes de publicar):

```bash
cd simulador
npx serve .
```

Abre la dirección que aparece (normalmente `http://localhost:3000`). Para ver la versión de celular en el computador: `F12` → ícono de celular (*Toggle device toolbar*) → elige un iPhone o un Android.

> Las fuentes y los iconos vienen de Google Fonts: se necesita internet.

---

## Paso 2 · Publicarlo en Vercel

Hay dos formas. La **A** es la más fácil y deja el sitio actualizándose solo con cada `git push`.

### Opción A · Desde la web de Vercel, conectado a GitHub (recomendada)

1. **Sube la carpeta `simulador/` a GitHub.** Desde la raíz del repositorio:
   ```bash
   git add simulador
   git commit -m "Simulador web de la app"
   git push
   ```
2. Entra a [vercel.com](https://vercel.com) y elige **Continue with GitHub**. Si es la primera vez, autoriza a Vercel para ver el repositorio `proyecto_junto`.
   > El repositorio es de la cuenta `chernandezmu`. Lo más simple es que esa persona haga estos pasos con su cuenta. Si lo hace otra persona, necesita acceso al repositorio en GitHub.
3. Toca **Add New… → Project**.
4. En **Import Git Repository**, busca `proyecto_junto` y toca **Import**.
5. En **Configure Project**:
   | Campo | Valor |
   |---|---|
   | Project Name | `junto-simulador` (o el que quieran: será parte del link) |
   | Framework Preset | **Other** |
   | Root Directory | toca **Edit** y elige **`simulador`** ← lo más importante |
   | Build and Output Settings | déjalo todo vacío (no hay nada que compilar) |
   | Environment Variables | ninguna |
6. Toca **Deploy**. En unos 20 segundos aparece “Congratulations!” con la vista previa.
7. Toca **Continue to Dashboard**. El link público está en **Domains**, por ejemplo `https://junto-simulador.vercel.app`.

**Actualizaciones:** cada `git push` a `main` vuelve a publicar el sitio solo. Los push a otras ramas crean un link de vista previa aparte, sin tocar el principal.

> **Opcional:** para que Vercel no publique de nuevo cuando solo cambia la app móvil, ve a **Settings → Git → Ignored Build Step**, elige **Custom** y escribe `git diff HEAD^ HEAD --quiet -- .` (solo publica si cambió algo dentro de `simulador/`).

### Opción B · Desde la terminal, con la CLI de Vercel

Sirve para publicar sin GitHub o para probar rápido.

1. Instala la CLI (una sola vez):
   ```bash
   npm install -g vercel
   ```
2. Entra a la carpeta y publica una vista previa:
   ```bash
   cd simulador
   vercel
   ```
   La primera vez pide iniciar sesión (abre el navegador) y hace unas preguntas. Responde:
   - *Set up and deploy?* → **Y**
   - *Which scope?* → tu cuenta
   - *Link to existing project?* → **N**
   - *Project name?* → `junto-simulador`
   - *In which directory is your code located?* → **`./`**
   - *Want to modify these settings?* → **N**
3. Al terminar muestra un link de vista previa. Para publicar el link definitivo:
   ```bash
   vercel --prod
   ```
4. Cada vez que cambies algo, repite `vercel --prod` dentro de `simulador/`.

---

## Paso 3 · Compartirlo y abrirlo en el celular

1. Comparte el link (`https://junto-simulador.vercel.app`) por WhatsApp, correo o en la diapositiva.
2. **Código QR para la presentación:** en Chrome de escritorio abre el link → menú ⋮ → **Transmitir, guardar y compartir → Crear código QR**. Descárgalo y ponlo en una diapositiva.
3. Al abrirlo en el celular aparece una tarjeta de bienvenida que explica cómo moverse. Toca **Empezar**.
4. **Para que se vea como una app de verdad** (sin la barra del navegador):
   - **iPhone (Safari):** botón Compartir → **Añadir a pantalla de inicio**.
   - **Android (Chrome):** menú ⋮ → **Añadir a pantalla principal** o **Instalar app**.

   Queda un ícono de Junto en el celular que abre el simulador a pantalla completa.

---

## Cómo se usa

| Dónde | Cómo cambiar de apartado |
|---|---|
| Computador | Menú de la izquierda. También tema (Oscuro · Claro · Sistema), estado del carné y **Reiniciar simulación** |
| Celular | Pestaña verde del borde izquierdo → se abre el mismo menú |
| Ambos | Navegando dentro de la app, como en el teléfono: pestañas de abajo, burbuja **+**, botones |

**Apartados incluidos** (los mismos de `design/pages/mvp.md`):

- **Entrar a la app:** Bienvenida animada · Entrar con código · Registro 1/3 (correo y autorización) · 2/3 (carné y fecha de nacimiento) · 3/3 (perfil e intereses).
- **Pestañas:** Inicio · Eventos · Wheels · Tours · Mis planes, con la burbuja **+** y la hoja “¿Qué quieres crear?”.
- **Unirse a un plan:** Feed con swipe (arrastra la tarjeta o usa ✕ / ✓; en el computador también ← →) · Detalle · Confirmar inscripción · ¡Estás dentro! · Chat (responde alguien del plan) · Día del plan con código · Calificar · Cancelar asistencia · Plan lleno.
- **Organizar:** Crear plan (con validación) · Plan publicado con solicitudes · Validar asistencia.
- **Perfil y seguridad:** Perfil · Ajustes (el tema cambia de verdad) · Privacidad · Bloqueados · Reportar · Normas, Política de datos y Términos.
- **Estados:** carné en revisión, carné rechazado, menor de edad, feed vacío, plan cancelado, sin conexión, error general y enlace roto.

**Datos de prueba**

| Para | Usa |
|---|---|
| Correo | cualquiera que termine en `@unbosque.edu.co` (otro dominio muestra el error real) |
| Código del correo | cualquier código de 6 dígitos, por ejemplo `123456` |
| Validar asistencia (organizador) | `4921` (Mateo) · `7310` (Sara) · `2584` (Juan) |
| Carné en revisión | en el menú, **Carné de Ana → En revisión**: no deja unirse ni crear, como en la app |

**Links directos a una pantalla:** agrega `#/` y el nombre del apartado al final del link. Sirve para dejar un QR que abra justo esa pantalla:

| Pantalla | Link |
|---|---|
| Feed con swipe | `https://junto-simulador.vercel.app/#/feed` |
| Chat del plan | `https://junto-simulador.vercel.app/#/chat:p3` |
| Día del plan (código) | `https://junto-simulador.vercel.app/#/today:p3` |
| Crear plan | `https://junto-simulador.vercel.app/#/create` |
| Perfil | `https://junto-simulador.vercel.app/#/me` |

(La barra del navegador siempre muestra el link de la pantalla en la que estás: puedes copiarlo tal cual.)

---

## Cómo modificarlo

Todo está en `index.html`, en tres bloques:

1. **`<style>`**: los tokens de color, tipografía y radios están al principio y son una copia de `mobile/src/theme/tokens.ts`. **Si cambian los colores de la app, cámbialos también aquí.**
2. **Datos de ejemplo** (`seedPlans`, `freshState`): planes, personas y mensajes.
3. **`SCREENS`**: una función por pantalla que devuelve su HTML. Los textos son los mismos de la app (`mobile/src/app/**`); si cambia un texto en la app, búscalo aquí y cámbialo igual.

Después de editar: revisa en local (Paso 1) y publica con `git push` (opción A) o `vercel --prod` (opción B).

---

## Si algo falla

| Problema | Solución |
|---|---|
| Vercel muestra **404: NOT_FOUND** | El **Root Directory** no es `simulador`. Ve a **Settings → Build and Deployment → Root Directory**, pon `simulador`, guarda y vuelve a publicar (**Deployments → ⋯ → Redeploy**) |
| Vercel intenta compilar o falla el build | **Framework Preset** debe ser **Other** y los comandos de build deben estar vacíos |
| Los iconos se ven como palabras (`home`, `chat`…) | No cargó la fuente de iconos: revisa la conexión. En redes que bloquean Google Fonts pasa lo mismo |
| En el celular se ve el teléfono dibujado y pequeño | La pantalla mide más de 700 px de ancho (tablet o celular girado). Gíralo en vertical |
| Quiero empezar de cero | Botón **Reiniciar simulación** del menú, o recargar la página |

## Limitaciones (es un simulador, no la app)

- No hay cuentas, correos, notificaciones ni base de datos: todo vive en la pestaña del navegador y se borra al recargar.
- La cámara del carné, el mapa, compartir y llamar al 123 se simulan con un aviso.
- Las personas, planes y mensajes son ficticios.
- La app real está en `mobile/` y se prueba con Expo Go (`mobile/README.md`).
