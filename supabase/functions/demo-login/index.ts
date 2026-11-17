// Junto · entrada de DEMO con el código fijo 123456 (sin correo).
//
// ⚠️ Cualquiera que tenga el link puede entrar con CUALQUIER correo @unbosque.edu.co
// (riesgo aceptado por el equipo para la demo; SECURITY.md §4). Antes de abrir la app a
// estudiantes reales: borra esta función en Supabase (Edge Functions → demo-login → Delete)
// y pon DEMO_CODE = null en mobile/src/lib/auth.tsx.
//
// Cómo funciona: con la llave de administrador (solo existe aquí, dentro de Supabase) crea
// la cuenta si no existe —el trigger del esquema sigue validando el dominio y crea el
// perfil— y genera un enlace mágico SIN enviarlo. Devuelve solo su token de un uso; la app
// lo canjea con verifyOtp({ token_hash }) y obtiene la sesión normal del usuario.
import { createClient } from 'npm:@supabase/supabase-js@2';

const DEMO_CODE = '123456';
const DOMAIN = '@unbosque.edu.co';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function adminKey(): string | undefined {
  // Llaves nuevas (sb_secret_…) si existen; si no, la service_role clásica.
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    if (typeof keys.default === 'string') return keys.default;
  } catch {
    // sigue con la clásica
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'METHOD' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? '').trim().toLowerCase();
    const code = String(body.code ?? '');

    if (code !== DEMO_CODE) return json({ error: 'BAD_CODE' }, 401);
    if (!email.endsWith(DOMAIN) || email.length <= DOMAIN.length || /\s/.test(email)) {
      return json({ error: 'DOMAIN_NOT_ALLOWED' }, 400);
    }

    const key = adminKey();
    if (!key) return json({ error: 'NO_ADMIN_KEY' }, 500);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Crea la cuenta ya confirmada; si ya existe, sigue.
    const created = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (created.error && !/already|exists|registered/i.test(created.error.message)) {
      return json({ error: created.error.message }, 400);
    }

    const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (error || !data?.properties?.hashed_token) return json({ error: error?.message ?? 'NO_TOKEN' }, 400);

    return json({ token_hash: data.properties.hashed_token });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
