# Junto en la web con GitHub Pages + Supabase

Paso a paso para dejar la app funcionando desde un link, con datos reales:

| Qué | Dirección |
|---|---|
| **App real**: entrar con el correo de la U, crear y unirse a planes, chat… | `https://chernandezmu.github.io/proyecto_junto/` |
| **Simulador** (datos de ejemplo, sin cuenta) | `https://chernandezmu.github.io/proyecto_junto/simulador/` |

Cómo funciona: GitHub Pages solo sirve los archivos de la página. La página habla directo con **Supabase**, que guarda los datos y aplica todas las reglas de seguridad (RLS + RPC). No hace falta otro servidor.

```
Celular o computador ──► GitHub Pages (la página)
        │
        └──────────────► Supabase (cuentas, base de datos, fotos, chat en vivo)
```

**Tiempo total:** unos 40 minutos la primera vez. Después, cada `git push` a `main` actualiza el sitio solo.

> **¿Ya tienen un proyecto de Supabase funcionando con la app del celular?** Úsenlo: solo hagan los pasos **2.8**, **3** y **4**. La web y el celular comparten la misma base de datos y las mismas cuentas.

---

## 1. Antes de empezar

Necesitas:
- La cuenta de GitHub **`chernandezmu`** (dueña del repositorio) o una con permiso de administrador en él.
- Una cuenta de Google (Gmail) para enviar los códigos de acceso. Mejor una creada para el proyecto, no la personal.
- El repositorio debe ser **público**. En el plan gratis de GitHub, Pages no funciona con repositorios privados. Hoy es público.

---

## 2. Crear la base de datos en Supabase

### 2.1 Crear el proyecto
1. Entra a [supabase.com](https://supabase.com) → **Start your project** → inicia sesión con GitHub.
2. **New project**:
   | Campo | Valor |
   |---|---|
   | Organization | la tuya (se crea sola la primera vez) |
   | Project name | `junto` |
   | Database password | toca **Generate a password** y **guárdala** en un gestor de contraseñas. No va en la app ni en el repositorio |
   | Region | **South America (São Paulo)**, la más cercana a Bogotá |
   | Plan | Free |
3. **Create new project**. Tarda unos 2 minutos.

### 2.2 Crear las tablas, la seguridad y el almacenamiento
Están en `supabase/migrations/`. Se ejecutan **en orden** y **cada una en su propia consulta**:

1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre en GitHub (o en tu editor) `supabase/migrations/20261029120000_init.sql`, copia **todo** el contenido, pégalo y toca **Run**. Debe decir `Success. No rows returned`.
3. **New query** otra vez, con `20261103120000_e4_seguridad.sql` → **Run**.
4. **New query** otra vez, con `20261103130000_e4_revision2.sql` → **Run**.

Para comprobar:
- **Table Editor** muestra `profiles`, `plans`, `messages`… y `campuses` con una fila, "Universidad El Bosque".
- **Storage** muestra los buckets `media` (público) y `verifications` (privado).

> Si un **Run** da error, no sigas con el siguiente archivo. Copia el mensaje y revisa que pegaste el archivo completo.

### 2.3 Entrar con código de 6 dígitos (sin contraseña)
1. **Authentication → Sign In / Providers → Email**:
   - **Enable Email provider**: activado.
   - **Confirm email**: activado.
   - **Secure email change**: activado.
   - **Email OTP Length**: `6`.
   - **Email OTP Expiration**: `600` (10 minutos).
   - **Save**.
2. En la misma página, deja **desactivados** Phone, Anonymous sign-ins y los proveedores sociales (Google, Apple…).

### 2.4 Plantillas del correo (que llegue el código, no un enlace)
**Authentication → Emails → Templates**:

1. **Magic Link**:
   - Subject: `Tu código de Junto`
   - Body (reemplaza todo):
     ```html
     <h2>Tu código para entrar a Junto</h2>
     <p style="font-size:32px;font-weight:800;letter-spacing:6px">{{ .Token }}</p>
     <p>Vence en 10 minutos. Si no lo pediste, ignora este correo.</p>
     ```
   - **Save changes**.
2. **Confirm signup** (el primer correo de una cuenta nueva): el mismo asunto y el mismo cuerpo → **Save changes**.

### 2.5 Enviar los correos con Gmail (obligatorio)
El correo que trae Supabase **solo llega a los miembros de tu equipo en Supabase**. Para que le llegue a cualquier estudiante:

1. En la cuenta de Google: [myaccount.google.com](https://myaccount.google.com) → **Seguridad** → activa la **Verificación en 2 pasos**.
2. Busca **Contraseñas de aplicaciones** (o entra a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)) → nombre `Junto Supabase` → **Crear**. Copia la contraseña de 16 letras.
3. En Supabase: **Authentication → Emails → SMTP Settings** → **Enable Custom SMTP**:
   | Campo | Valor |
   |---|---|
   | Sender email | el correo de Gmail |
   | Sender name | `Junto` |
   | Host | `smtp.gmail.com` |
   | Port number | `465` |
   | Username | el correo de Gmail |
   | Password | la contraseña de aplicación de 16 letras |
4. **Save changes**.

> Gmail permite unos 500 correos al día: alcanza para la prueba. Si no llegan, revisa la carpeta de spam.

### 2.6 Límites de uso
**Authentication → Rate Limits**: deja los valores que vienen. Protegen contra el envío masivo de códigos.

### 2.7 Revisión de seguridad
**Advisors → Security Advisor**: no debe haber alertas en rojo (**ERROR**). Las amarillas se pueden revisar con calma.

### 2.8 Permitir la dirección de GitHub Pages
**Authentication → URL Configuration**:
- **Site URL**: `https://chernandezmu.github.io/proyecto_junto/`
- **Redirect URLs** → **Add URL**: `https://chernandezmu.github.io/proyecto_junto/**`
- **Save**.

(Con códigos de 6 dígitos casi no se usan redirecciones, pero así los correos y los enlaces de Supabase apuntan a la web correcta.)

### 2.9 Copiar los dos datos de conexión
Los necesitas en el paso 4:

1. **Project URL**: **Project Settings → Data API** (o el botón **Connect** de arriba). Tiene la forma `https://abcdefghijk.supabase.co`.
2. **Clave publicable**: **Project Settings → API Keys** → **Publishable key** (`sb_publishable_...`). Si tu proyecto solo muestra las claves antiguas, usa la **anon public**.

> ⚠️ **Nunca** uses la **secret key** (`sb_secret_...`) ni la **service_role**: saltan toda la seguridad. La clave publicable sí puede ir en una página pública, porque la protección está en las reglas de la base de datos. Si por error pones la secreta, el flujo de publicación se detiene con un aviso.

Para la app del celular, los mismos dos valores van en `mobile/.env` (ver `supabase/README.md`, paso 7).

---

## 3. Activar GitHub Pages en el repositorio

1. Entra a `https://github.com/chernandezmu/proyecto_junto` → **Settings**.
2. Menú izquierdo → **Pages**.
3. En **Build and deployment → Source**, elige **GitHub Actions**.

No hay que tocar nada más en esa página.

---

## 4. Darle a GitHub los datos de Supabase

1. En el repositorio: **Settings → Secrets and variables → Actions**.
2. Pestaña **Variables** → **New repository variable**:
   | Name | Value |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | la Project URL del paso 2.9 |
3. **New repository variable** otra vez:
   | Name | Value |
   |---|---|
   | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la clave publicable del paso 2.9 |

Se usan **Variables** y no **Secrets** porque son valores públicos: terminan dentro de la página que descarga cualquier visitante. Si prefieren guardarlas como **Secrets**, también funciona.

---

## 5. Publicar

El flujo `.github/workflows/pages.yml` publica solo en cada `git push` a `main`. Para la primera vez:

1. En el repositorio → pestaña **Actions** → a la izquierda **GitHub Pages** → **Run workflow** → rama `main` → **Run workflow**.
   (Si ya hubo un push y falló porque faltaban las variables del paso 4, abre esa ejecución y toca **Re-run all jobs**.)
2. Espera unos 3 a 5 minutos, hasta que los dos pasos (**Compilar la web** y **Publicar**) tengan ✅.
3. El link aparece en la ejecución, debajo de **Publicar**, y en **Settings → Pages**: `https://chernandezmu.github.io/proyecto_junto/`.

---

## 6. Probar que todo funciona

1. Abre el link en el celular. Debe aparecer la bienvenida animada de Junto.
2. **Crear cuenta con mi correo U** → escribe un correo `@unbosque.edu.co` → acepta la autorización → **Enviarme el código**.
3. Revisa el correo (y el spam) → escribe el código de 6 dígitos.
4. **Paso 2 de 3:** escanea el carné con la cámara (el navegador pide permiso) o sube un archivo, y escribe el código estudiantil y la fecha de nacimiento → **Enviar a verificación**.
5. **Paso 3 de 3:** nombre, carrera e intereses → la app queda con el aviso "Estamos revisando tu carné".
6. **Aprueba el carné** (paso 7) y recarga la página: ya puedes crear planes y unirte.

**Para que se vea como una app instalada:**
- **iPhone (Safari):** Compartir → **Añadir a pantalla de inicio**.
- **Android (Chrome):** menú ⋮ → **Añadir a pantalla principal**.

---

## 7. Aprobar carnés

Cada cuenta nueva queda "en revisión" hasta que alguien del equipo revisa el carné. Desde Supabase:

1. **Storage → verifications** → carpeta con el id de la persona → abre el archivo. Comprueba:
   - que es de El Bosque y está vigente;
   - que el nombre coincide;
   - que tiene 18 años o más.
2. **SQL Editor → New query**, cambia el correo y toca **Run**:
   ```sql
   -- Aprobar
   update public.profiles
   set verification_status = 'approved', verified_at = now(), rejection_reason = null
   where id = (select id from auth.users where email = 'nombre@unbosque.edu.co');
   ```
   Para rechazar (la app le pide subirlo de nuevo):
   ```sql
   update public.profiles
   set verification_status = 'rejected', rejection_reason = 'La foto está borrosa'
   where id = (select id from auth.users where email = 'nombre@unbosque.edu.co');
   ```
3. Para ver quién está esperando:
   ```sql
   select u.email, p.full_name, p.verification_status, p.created_at
   from public.profiles p join auth.users u on u.id = p.id
   where p.verification_status = 'in_review'
   order by p.created_at;
   ```

Más detalles (reportes, borrar carnés a los 30 días): `supabase/README.md`, pasos 2 y 3.

**Opcional, planes de ejemplo:** cuando 2 a 4 cuentas del equipo estén aprobadas, ejecuta `supabase/demo/seed_demo.sql` en el SQL Editor (antes cambia los correos que indica el archivo). Así el feed no arranca vacío.

---

## 8. Qué cambia frente a la app del celular

| Función | En la web |
|---|---|
| Entrar, registrarse, carné, perfil, feed con swipe, unirse, chat en vivo, código de asistencia, calificar, crear y gestionar planes, reportar, bloquear | ✅ Igual |
| Recordatorio 1 h antes | ❌ No existe (el navegador no puede programar avisos locales). La opción se oculta |
| Confirmaciones ("¿Cerrar sesión?", "¿Cancelar el plan?") | Usan las ventanas del navegador (Aceptar / Cancelar) |
| Opciones de un mensaje del chat | Se abren **tocando** el mensaje (en el celular es manteniéndolo pulsado) |
| Compartir un plan | Menú de compartir del celular; en computador, copia el texto |
| Descargar mis datos | Descarga un archivo `mis-datos-junto.json` |
| Fechas | Selector de fecha del navegador |
| Sesión | Se guarda en el navegador (`localStorage`), no en el almacén cifrado del teléfono. Ver `SECURITY.md` |

---

## 9. Si algo falla

| Problema | Solución |
|---|---|
| En **Actions**, "Compilar la web" falla con *Faltan las variables…* | Haz el paso 4 y luego **Re-run all jobs** |
| "Publicar" falla con *Get Pages site failed* o *not found* | Falta el paso 3: **Settings → Pages → Source → GitHub Actions** |
| El link da **404** de GitHub | La primera publicación tarda unos minutos. Revisa que la ejecución de **Actions** terminó en ✅ |
| Página en blanco | Abre la consola del navegador (F12). Si dice *Invalid API key*, la clave del paso 4 está mal copiada |
| La app dice que **no está configurada** | Las variables no llegaron al compilar. Revisa los nombres exactos del paso 4 y vuelve a ejecutar el flujo |
| **No llega el código** | Revisa spam; revisa el SMTP (paso 2.5); en **Authentication → Logs** se ve el error. Solo funcionan correos `@unbosque.edu.co` |
| "Por ahora Junto es solo para la Universidad El Bosque" | Es correcto: el servidor solo acepta correos `@unbosque.edu.co` |
| Se quedó en "Estamos revisando tu carné" | Hay que aprobarlo (paso 7) y recargar la página |
| La cámara no abre | Acepta el permiso del navegador. Si lo negaste, actívalo en el candado junto a la dirección, o usa "Sube un archivo" |
| Cambié el código y la web no cambió | Mira en **Actions** que terminó la ejecución del push; luego recarga sin caché (Ctrl+Shift+R) |
| Supabase "pausó" el proyecto | El plan gratis pausa proyectos sin uso por una semana: entra al panel y toca **Restore project** |

---

## Para el equipo técnico

- **Compilación:** `cd mobile && npx expo export --platform web` (con `EXPO_BASE_URL=/proyecto_junto` para Pages; lo lee `mobile/app.config.js`).
- **Probar la web en local:** `cd mobile && npx expo start --web` (usa `mobile/.env`).
- **Código solo para web:**
  - `src/lib/storage.web.ts`: sesión en `localStorage`;
  - `src/lib/notifications.web.ts`: sin recordatorios;
  - `src/lib/dialog.ts`: `showAlert`, `shareText` y `saveTextFile`. **No uses `Alert.alert`**: en la web no hace nada;
  - el `<input>` de fecha en `src/components/DateField.tsx`;
  - el chequeo de conexión en `src/components/OfflineBanner.tsx`.
- **Rutas internas:** el flujo copia `index.html` como `404.html`, así `/plan/123` funciona al recargar o al abrir un link compartido.
