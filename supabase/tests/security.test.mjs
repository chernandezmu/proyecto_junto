// Pruebas de seguridad del esquema (RLS y RPC) sobre PGlite con stubs de Supabase.
// Prueba las reglas principales: aislamiento por campus, códigos, columnas protegidas,
// cupo, bloqueos, chat, doble ciego y borrado de cuenta.
// Ejecutar: cd supabase/tests && npm install && npm test
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const migration = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => readFileSync(join(dir, f), 'utf8'))
  .join('\n');
const db = new PGlite();

const stubs = `
create role anon nologin; create role authenticated nologin; create role supabase_auth_admin nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;
create schema storage;
create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner_id text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
create publication supabase_realtime;
grant usage on schema public to authenticated, anon;
`;

let pass = 0, fail = 0;
const ok = (name) => { pass++; console.log('  ✓', name); };
const bad = (name, e) => { fail++; console.log('  ✗', name, '→', e); };

async function as(uid, sql, params) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role authenticated;`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
async function expectOk(name, uid, sql, params, check) {
  try { const r = await as(uid, sql, params); if (check && !check(r)) bad(name, JSON.stringify(r.rows)); else ok(name); return r; }
  catch (e) { bad(name, e.message); }
}
async function expectErr(name, uid, sql, params, match) {
  try { const r = await as(uid, sql, params); bad(name, 'no falló: ' + JSON.stringify(r.rows)); }
  catch (e) { if (!match || e.message.includes(match)) ok(name + ` (${e.message})`); else bad(name, e.message); }
}

await db.exec(stubs);
await db.exec(migration);
console.log('Migración aplicada.');

const A = '00000000-0000-0000-0000-00000000000a';
const B = '00000000-0000-0000-0000-00000000000b';
const E = '00000000-0000-0000-0000-00000000000e';
const M = '00000000-0000-0000-0000-00000000000f';

console.log('\nAltas');
await db.exec(`insert into public.campuses (name, short_name, email_domain) values ('Uniandes', 'Andes', 'uniandes.edu.co')`);
try { await db.exec(`insert into auth.users values ('${A}', 'ana@unbosque.edu.co'), ('${B}', 'luis@unbosque.edu.co'), ('${E}', 'eva@uniandes.edu.co'), ('${M}', 'menor@unbosque.edu.co')`); ok('altas con dominio permitido'); } catch (e) { bad('altas', e.message); }
try { await db.exec(`insert into auth.users values (gen_random_uuid(), 'x@gmail.com')`); bad('gmail rechazado', 'se creó'); } catch (e) { e.message.includes('DOMAIN_NOT_ALLOWED') ? ok('gmail rechazado') : bad('gmail rechazado', e.message); }
await db.exec(`update public.profiles set verification_status = 'approved', full_name = case id when '${A}' then 'Ana M.' when '${B}' then 'Luis R.' else 'Eva' end where id in ('${A}', '${B}', '${E}')`);

console.log('\nVerificación');
await expectErr('menor de 18 rechazado', M, `select public.submit_verification((current_date - interval '17 years')::date, '20231234', '${M}/carne.jpg')`, [], 'UNDERAGE');
await expectErr('archivo de otra persona rechazado', M, `select public.submit_verification('2000-01-01', '20231234', '${A}/carne.jpg')`, [], 'BAD_FILE');
await db.exec(`insert into storage.objects (bucket_id, name, owner_id) values ('verifications', '${M}/carne.jpg', '${M}')`);
await expectOk('envío válido', M, `select public.submit_verification('2000-01-01', '20231234', '${M}/carne.jpg')`);
await expectOk('queda en revisión', M, `select verification_status::text s from public.profiles`, [], (r) => r.rows[0].s === 'in_review');
await expectErr('no puede auto-aprobarse', M, `update public.profiles set verification_status = 'approved' where id = '${M}'`, [], 'permission denied');
await expectErr('sin verificar no crea planes', M, `select public.create_plan('Plan', 'estudio', now() + interval '2 hours', 'Bloque C', 10, 3, 'open')`, [], 'NOT_VERIFIED');
await expectOk('puede editar su nombre', M, `update public.profiles set full_name = 'Menor' where id = '${M}'`);

console.log('\nPlanes y aislamiento por campus');
const r = await expectOk('Ana crea un plan', A, `select public.create_plan('Parche de estudio', 'estudio', now() + interval '30 minutes', 'Bloque C', 2, 3, 'open') as id`, [], (r) => !!r.rows[0].id);
const plan = r?.rows[0].id;
await expectErr('fecha pasada rechazada', A, `select public.create_plan('Viejo', 'estudio', now() - interval '1 hour', 'X', 5, 3, 'open')`, [], 'BAD_DATE');
await expectOk('Luis ve el plan en su feed', B, `select public.get_feed() as f`, [], (r) => r.rows[0].f.length === 1);
await expectOk('Eva (otro campus) no lo ve', E, `select public.get_feed() as f`, [], (r) => r.rows[0].f.length === 0);
await expectErr('Eva no abre el plan por id', E, `select public.get_plan($1)`, [plan], 'NOT_FOUND');
await expectErr('sin acceso directo a plans', B, `select * from public.plans`, [], 'permission denied');
await expectOk('perfiles: solo el propio', B, `select id from public.profiles`, [], (r) => r.rows.length === 1 && r.rows[0].id === B);
await expectErr('anon no ejecuta RPC', null, `select public.get_feed()`, [], '');

console.log('\nInscripción y código');
await expectOk('Luis se une', B, `select public.join_plan($1) as j`, [plan], (r) => r.rows[0].j.status === 'joined');
const code = (await as(B, `select public.get_my_code($1) as c`, [plan])).rows[0].c;
/^\d{4}$/.test(code ?? '') ? ok('Luis obtiene su código ' + code) : bad('código', code);
await expectErr('Luis no lee códigos directo', B, `select attendance_code from public.plan_members`, [], 'permission denied');
await expectErr('Eva no se une', E, `select public.join_plan($1)`, [plan], 'NOT_FOUND');
await expectErr('Ana no se une a su propio plan', A, `select public.join_plan($1)`, [plan], 'OWN_PLAN');
await expectOk('Menor (sin verificar) no se une', M, `select 1`);
await expectErr('Menor sin verificar no se une', M, `select public.join_plan($1)`, [plan], 'NOT_VERIFIED');
await expectErr('Luis no valida asistencia (no organiza)', B, `select public.check_in($1, $2)`, [plan, code], 'NOT_FOUND');
await expectOk('código incorrecto', A, `select public.check_in($1, $2) as r`, [plan, code === '0000' ? '9999' : '0000'], (r) => r.rows[0].r.error === 'BAD_CODE');
await expectOk('código correcto', A, `select public.check_in($1, $2) as p`, [plan, code], (r) => r.rows[0].p.name === 'Luis R.');
await expectErr('cancelar fuera de plazo', B, `select public.cancel_attendance($1)`, [plan], 'CANCEL_CLOSED');

console.log('\nChat');
await expectOk('Luis escribe', B, `select public.send_message($1, 'Hola!')`, [plan]);
await expectOk('Ana lee el chat', A, `select public.get_messages($1) as m`, [plan], (r) => r.rows[0].m.length === 1);
await expectOk('Realtime: Luis lee mensajes directo', B, `select count(*)::int as n from public.messages`, [], (r) => r.rows[0].n === 1);
await expectOk('Realtime: Eva no ve mensajes', E, `select count(*)::int as n from public.messages`, [], (r) => r.rows[0].n === 0);
await expectErr('Eva no lee el chat por RPC', E, `select public.get_messages($1)`, [plan], 'NOT_FOUND');
await expectErr('nadie inserta mensajes directo', B, `insert into public.messages (plan_id, user_id, body) values ($1, $2, 'x')`, [plan, B], 'permission denied');

console.log('\nCupo');
const r2 = await as(A, `select public.create_plan('Fútbol', 'deporte', now() + interval '1 day', 'Cancha', 2, 3, 'open') as id`);
const plan2 = r2.rows[0].id;
await db.exec(`update public.profiles set verification_status = 'approved' where id = '${M}'`);
await expectOk('Luis entra (1/2)', B, `select public.join_plan($1) as j`, [plan2], (r) => r.rows[0].j.status === 'joined');
await expectOk('Menor entra (2/2)', M, `select public.join_plan($1) as j`, [plan2], (r) => r.rows[0].j.status === 'joined');
await expectOk('lleno sale del feed', M, `select public.get_feed() as f`, [], (r) => r.rows[0].f.every((p) => p.id !== plan2));
await expectOk('Luis cancela a tiempo', B, `select public.cancel_attendance($1, 'Me cruzo con clase')`, [plan2]);

console.log('\nBloqueos');
await expectOk('Menor bloquea a Ana', M, `select public.block_user($1)`, [A]);
await expectOk('Menor ya no ve planes de Ana', M, `select public.get_feed() as f`, [], (r) => r.rows[0].f.length === 0);
await expectErr('Menor no abre plan de Ana', M, `select public.get_plan($1)`, [plan2], 'NOT_FOUND');

console.log('\nCalificación y cuenta');
await expectErr('no se califica antes de empezar', B, `select public.rate_plan($1, 5)`, [plan2], 'NOT_FINISHED');
await db.exec(`update public.plans set starts_at = now() - interval '7 hours' where id = '${plan}'`);
await expectOk('Luis califica un plan terminado', B, `select public.rate_plan($1, 4, array[$2]::uuid[])`, [plan, A]);
await db.exec(`update public.plans set finished_at = now() - interval '4 days' where id = '${plan}'`);
await expectOk('calificación revelada a los 3 días', B, `select public.get_plan($1) as p`, [plan], (r) => Number(r.rows[0].p.organizerRating) === 4);
await expectErr('Eva (otro campus) no califica', E, `select public.rate_plan($1, 1)`, [plan], 'NOT_FOUND');
await expectOk('pasado aparece en Mis planes', B, `select public.get_my_plans('past') as p`, [], (r) => r.rows[0].p.some((x) => x.id === plan));
await expectOk('exportar datos', B, `select public.export_my_data() as d`, [], (r) => !!r.rows[0].d.perfil && !('verification_file' in r.rows[0].d.perfil));
await expectOk('get_me', B, `select public.get_me() as m`, [], (r) => r.rows[0].m.campus.shortName === 'El Bosque');
await expectOk('borrar cuenta', E, `select public.delete_my_account()`);
const left = await db.query(`select count(*)::int n from public.profiles where id = '${E}'`);
left.rows[0].n === 0 ? ok('perfil borrado en cascada') : bad('cascada', left.rows[0].n);

// ── E4 · Regresiones de la revisión de seguridad (2026-11-03) ──────────────────
console.log('\nE4 · Regresiones');
const N = '00000000-0000-0000-0000-00000000001a';
const P = '00000000-0000-0000-0000-00000000001b';
await db.exec(`insert into auth.users values ('${N}', 'nora@unbosque.edu.co'), ('${P}', 'pedro@unbosque.edu.co')`);
await db.exec(`update public.profiles set verification_status = 'approved', full_name = 'Nora' where id = '${N}'`);

// H1: "Solo mis planes" se respeta en "Quién va".
await db.exec(`update public.profiles set visibility = 'plans' where id = '${B}'`);
const plan4 = (await as(A, `select public.create_plan('Club de lectura', 'cultura', now() + interval '1 day', 'Biblioteca', 10, 3, 'open') as id`)).rows[0].id;
await expectOk('Luis se une al club', B, `select public.join_plan($1) as j`, [plan4], (r) => r.rows[0].j.status === 'joined');
await expectOk('H1 · Nora (no comparte el plan) ve a Luis anónimo', N, `select public.get_plan($1) as p`, [plan4],
  (r) => r.rows[0].p.attendees.length === 1 && r.rows[0].p.attendees[0].name === 'Estudiante' && r.rows[0].p.attendees[0].photo === null && r.rows[0].p.attendees[0].career === null);
await expectOk('H1 · la organizadora ve a Luis con su nombre', A, `select public.get_plan($1) as p`, [plan4], (r) => r.rows[0].p.attendees[0].name === 'Luis R.');
await expectOk('H1 · Luis se ve a sí mismo', B, `select public.get_plan($1) as p`, [plan4], (r) => r.rows[0].p.attendees[0].name === 'Luis R.');

// H3: rechazado no puede volver a pedir cupo y el plan sale de su feed.
const plan3 = (await as(A, `select public.create_plan('Taller privado', 'arte', now() + interval '2 days', 'Bloque A', 5, 3, 'approval') as id`)).rows[0].id;
await expectOk('Nora pide cupo', N, `select public.join_plan($1) as j`, [plan3], (r) => r.rows[0].j.status === 'pending');
await expectOk('Ana la rechaza', A, `select public.respond_request($1, $2, false)`, [plan3, N]);
await expectErr('H3 · Nora no puede volver a pedir', N, `select public.join_plan($1)`, [plan3], 'REJECTED');
await expectOk('H3 · el plan sale de su feed', N, `select public.get_feed() as f`, [], (r) => r.rows[0].f.every((x) => x.id !== plan3));

// H2: sin asistencias validadas, una calificación no se revela al instante.
const plan5 = (await db.query(`insert into public.plans (campus_id, organizer_id, title, category, starts_at, place, capacity)
  select campus_id, id, 'Picnic', 'naturaleza', now() - interval '1 hour', 'Parque', 10 from public.profiles where id = '${A}' returning id`)).rows[0].id;
await db.exec(`insert into public.plan_members (plan_id, user_id, status, attendance_code) values ('${plan5}', '${N}', 'joined', '1234')`);
await expectOk('Nora califica el picnic con 1', N, `select public.rate_plan($1, 1)`, [plan5]);
await expectOk('H2 · la nota de Nora no se revela todavía', A, `select public.get_me() as m`, [], (r) => Number(r.rows[0].m.stats.rating) === 4);

// E2: la foto solo puede apuntar a la carpeta propia.
await expectErr('E2 · foto de otra carpeta rechazada', N, `update public.profiles set photo_path = '${A}/x.jpg' where id = '${N}'`, [], 'row-level security');
await expectOk('E2 · foto de la carpeta propia', N, `update public.profiles set photo_path = '${N}/x.jpg' where id = '${N}'`);

// E1: sin carné enviado no se ven planes.
await expectErr('E1 · sin carné enviado no ve el feed', P, `select public.get_feed()`, [], 'NOT_VERIFIED');
await expectErr('E1 · sin carné enviado no abre planes', P, `select public.get_plan($1)`, [plan4], 'NOT_VERIFIED');

// E3: el correo solo cambia a otro del mismo campus.
try { await db.exec(`update auth.users set email = 'nora@gmail.com' where id = '${N}'`); bad('E3 · cambio a gmail', 'se permitió'); } catch (e) { e.message.includes('DOMAIN_NOT_ALLOWED') ? ok('E3 · cambio a gmail rechazado') : bad('E3', e.message); }
try { await db.exec(`update auth.users set email = 'nora@uniandes.edu.co' where id = '${N}'`); bad('E3 · cambio a otro campus', 'se permitió'); } catch (e) { e.message.includes('DOMAIN_NOT_ALLOWED') ? ok('E3 · cambio a otro campus rechazado') : bad('E3', e.message); }
try { await db.exec(`update auth.users set email = 'nora.p@unbosque.edu.co' where id = '${N}'`); ok('E3 · cambio dentro del campus permitido'); } catch (e) { bad('E3 · mismo campus', e.message); }

// ── E4 · Segunda revisión (independiente) ─────────────────────────────────────
console.log('\nE4 · Segunda revisión');
const K = '00000000-0000-0000-0000-00000000001c';
const X = '00000000-0000-0000-0000-00000000001d';
await db.exec(`insert into auth.users values ('${K}', 'kai@unbosque.edu.co'), ('${X}', 'xime@uniandes.edu.co')`);
await db.exec(`update public.profiles set verification_status = 'approved', full_name = case id when '${K}' then 'Kai' else 'Xime' end where id in ('${K}', '${X}')`);

// C1: el id real del asistente anónimo ya no sale, y no se puede bloquear para leer el perfil.
const anon = (await as(N, `select public.get_plan($1) as p`, [plan4])).rows[0].p.attendees[0];
anon.id !== B ? ok('C1 · la entrada anónima no expone el id real') : bad('C1 · id real expuesto', anon.id);
await expectErr('C1 · bloquear el id anónimo no sirve', N, `select public.block_user($1)`, [anon.id], 'NOT_FOUND');
await expectErr('C1 · otro campus no puede bloquear a Luis', X, `select public.block_user($1)`, [B], 'NOT_FOUND');
await expectOk('Nora bloquea a Luis (mismo campus)', N, `select public.block_user($1)`, [B]);
await expectOk('C1 · get_blocked respeta "Solo mis planes"', N, `select public.get_blocked() as b`, [],
  (r) => r.rows[0].b.length === 1 && r.rows[0].b[0].name === 'Estudiante' && r.rows[0].b[0].photo === null);
await expectOk('Nora desbloquea a Luis', N, `select public.unblock_user($1)`, [B]);

// C2: solo cuentan antes de tiempo las notas de quien llegó, con el plan terminado y ≥ 2 validados.
const plan6 = (await db.query(`insert into public.plans (campus_id, organizer_id, title, category, starts_at, place, capacity)
  select campus_id, id, 'Pizza', 'comida', now() - interval '1 hour', 'Cafetería', 10 from public.profiles where id = '${A}' returning id`)).rows[0].id;
await db.exec(`insert into public.plan_members (plan_id, user_id, status, attendance_code, checked_in_at) values
  ('${plan6}', '${N}', 'joined', '0001', now()), ('${plan6}', '${K}', 'joined', '0002', now()), ('${plan6}', '${B}', 'joined', '0003', null)`);
await expectOk('Nora (llegó) califica 5', N, `select public.rate_plan($1, 5)`, [plan6]);
await expectOk('Kai (llegó) califica 5', K, `select public.rate_plan($1, 5)`, [plan6]);
await expectOk('C2 · con el plan abierto no se revela', A, `select public.get_me() as m`, [], (r) => Number(r.rows[0].m.stats.rating) === 4);
await expectOk('Ana termina el plan', A, `select public.finish_plan($1)`, [plan6]);
await expectOk('C2 · terminado y todos los que llegaron calificaron → se revela', A, `select public.get_me() as m`, [], (r) => Number(r.rows[0].m.stats.rating) === 4.7);
await expectOk('Luis (no validado) califica 1', B, `select public.rate_plan($1, 1)`, [plan6]);
await expectOk('C2 · la nota de quien no llegó espera a los 3 días', A, `select public.get_me() as m`, [], (r) => Number(r.rows[0].m.stats.rating) === 4.7);

// C3: los códigos incorrectos cuentan para el límite.
const plan7 = (await db.query(`insert into public.plans (campus_id, organizer_id, title, category, starts_at, place, capacity)
  select campus_id, id, 'Café', 'comida', now() + interval '30 minutes', 'Cafetería', 10 from public.profiles where id = '${A}' returning id`)).rows[0].id;
await db.exec(`insert into public.plan_members (plan_id, user_id, status, attendance_code) values ('${plan7}', '${N}', 'joined', '7777')`);
let bads = 0;
for (let i = 0; i < 5; i++) { const r = await as(A, `select public.check_in($1, $2) as r`, [plan7, String(1000 + i)]); if (r.rows[0].r.error === 'BAD_CODE') bads++; }
bads === 5 ? ok('C3 · 5 códigos incorrectos devuelven BAD_CODE') : bad('C3 · BAD_CODE', bads);
await expectErr('C3 · el sexto intento queda bloqueado', A, `select public.check_in($1, '7777')`, [plan7], 'RATE_LIMITED');

// C4: el carné tiene que existir en Storage.
await expectErr('C4 · ruta inventada rechazada', P, `select public.submit_verification('2000-01-01', '20231234', $1)`, [`${P}/no-existe.jpg`], 'BAD_FILE');
await db.exec(`insert into storage.objects (bucket_id, name, owner_id) values ('verifications', '${P}/carne.jpg', '${A}')`);
await expectErr('C4 · archivo con otro dueño rechazado', P, `select public.submit_verification('2000-01-01', '20231234', $1)`, [`${P}/carne.jpg`], 'BAD_FILE');
await db.exec(`update storage.objects set owner_id = '${P}' where name = '${P}/carne.jpg'`);
await expectOk('C4 · archivo propio subido → en revisión', P, `select public.submit_verification('2000-01-01', '20231234', $1)`, [`${P}/carne.jpg`]);

// C5: "Ya llegué" es un mensaje normal del autor, solo desde 2 h antes y en planes publicados.
await expectErr('C5 · "Ya llegué" un día antes rechazado', B, `select public.mark_arrived($1)`, [plan4], 'CLOSED');
await expectOk('C5 · "Ya llegué" 30 min antes', N, `select public.mark_arrived($1)`, [plan7]);
await expectOk('C5 · queda como mensaje de la autora, no de sistema', N, `select public.get_messages($1) as m`, [plan7],
  (r) => { const last = r.rows[0].m.at(-1); return last.kind === 'user' && last.mine === true && last.author?.name === 'Nora'; });
await db.exec(`update public.plans set status = 'cancelled' where id = '${plan7}'`);
await expectErr('C5 · en un plan cancelado rechazado', N, `select public.mark_arrived($1, true)`, [plan7], 'CLOSED');

// Notas: correo con varias @, terminar antes de empezar, lista de espera de otro campus.
try { await db.exec(`insert into auth.users values (gen_random_uuid(), 'x@unbosque.edu.co@gmail.com')`); bad('dominio con varias @', 'se creó'); } catch (e) { e.message.includes('DOMAIN_NOT_ALLOWED') ? ok('dominio con varias @ rechazado') : bad('dominio varias @', e.message); }
await expectErr('terminar un plan antes de que empiece', A, `select public.finish_plan($1)`, [plan4], 'NOT_FOUND');
await expectErr('lista de espera de un plan de otro campus', X, `select public.set_plan_waitlist($1, true)`, [plan4], 'NOT_FOUND');

console.log(`\n${pass} ok · ${fail} fallos`);
process.exit(fail ? 1 : 0);
