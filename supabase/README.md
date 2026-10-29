# Backend de Junto (Supabase)

Toda la lógica de seguridad vive aquí: RLS activado en todas las tablas y funciones RPC que validan en el servidor el campus, la verificación, los bloqueos, los cupos, los plazos y los límites de uso. Detalle en [`../SECURITY.md`](../SECURITY.md).

## 1. Crear el proyecto (una vez)

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto. Región: **South America (São Paulo)**. Guarda la contraseña de la base de datos en un gestor de contraseñas: no va en la app ni en el repo.
2. **SQL Editor → New query**: pega todo `migrations/20261029120000_init.sql` y ejecútalo (Run). Debe terminar sin errores.
3. **Authentication → Sign In / Providers → Email**:
   - Email activado, **"Confirm email" activado**.
   - **Email OTP Length: 6**. Expiración: 600 segundos.
4. **Authentication → Emails → Templates → "Magic Link"**: usa el código, no el enlace. Asunto `Tu código de Junto` y cuerpo:

   ```html
   <h2>Tu código para entrar a Junto</h2>
   <p style="font-size:32px;font-weight:800;letter-spacing:6px">{{ .Token }}</p>
   <p>Vence en 10 minutos. Si no lo pediste, ignora este correo.</p>
   ```

   Haz lo mismo en **"Confirm signup"** (el primer correo de una cuenta nueva).
5. **Authentication → Emails → SMTP Settings**: el correo integrado de Supabase **solo envía a los miembros de tu equipo en Supabase**. Para que les llegue a otros estudiantes, configura un SMTP propio. Para la demo vale Gmail:
   - en la cuenta de Google: Seguridad → Verificación en 2 pasos → **Contraseñas de aplicaciones** → crear una;
   - Host `smtp.gmail.com`, puerto `465`, usuario = el correo y contraseña = la contraseña de aplicación;
   - Sender email = el mismo correo, Sender name = `Junto`.
6. **Authentication → Rate Limits**: deja los de fábrica (protegen el envío de códigos).
7. **Project Settings → API**: copia **Project URL** y la clave **publishable** (o `anon`) en `../mobile/.env`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   **Nunca** copies la `service_role` / secret key ni la contraseña de la base de datos a la app.
8. **Advisors → Security Advisor**: revisa que no haya alertas en rojo.

## 2. Aprobar carnés (revisión en < 24 h)

Para la demo se hace desde el panel de Supabase (el panel web propio es P1):

1. **Table Editor → profiles**: filtra `verification_status = in_review`.
2. **Storage → verifications → carpeta con el id de la persona**: abre el archivo y comprueba:
   - que es de la Universidad El Bosque y está vigente;
   - que el nombre coincide;
   - que la fecha de nacimiento da **18 años o más**.
3. Si todo está bien: en `profiles`, cambia `verification_status` a `approved` y pon `verified_at = now()`.
4. Si no: cambia `verification_status` a `rejected` y escribe `rejection_reason` (por ejemplo "La foto está borrosa", "No está vigente", "No coincide con tu nombre"). La app le pide subirlo de nuevo.
5. Borra el archivo de `verifications` 30 días después de revisarlo (promesa de la política de datos).

## 3. Reportes

**Table Editor → reports** (`status = open`). Revísalos en menos de 24 h. Si hace falta, cancela el plan (`plans.status = cancelled`) o suspende la cuenta (Authentication → Users → Ban).

## 4. Pruebas de seguridad del esquema

```bash
cd supabase/tests
npm install
npm test        # 50 ok · 0 fallos
```

Corren la migración sobre PGlite (Postgres en WebAssembly) con stubs de Supabase. Comprueban:
- aislamiento entre campus;
- la regla 18+;
- columnas protegidas y códigos de asistencia privados;
- el cupo;
- los bloqueos;
- el chat solo para miembros;
- la calificación a doble ciego;
- el borrado de cuenta.

Si cambias el SQL, crea una **migración nueva** (no edites una ya aplicada) y vuelve a correr las pruebas.
