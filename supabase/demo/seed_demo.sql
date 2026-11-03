-- Junto · datos de demostración para la presentación de clase
-- ----------------------------------------------------------------------------
-- Crea planes realistas del campus para los próximos 3 días, organizados por cuentas
-- REALES del equipo, que deben estar registradas en la app y aprobadas
-- (verification_status = 'approved').
--
-- Uso: Supabase → SQL Editor → pega este archivo, cambia los correos de la línea
-- marcada y ejecútalo. Se puede correr varias veces: primero borra los planes de demo
-- anteriores (los reconoce por la descripción "· Plan de demostración").
--
-- Es solo para la demo: no lo ejecutes en un proyecto con estudiantes reales.
--
-- OJO en la presentación: la app limita a 3 los planes activos por persona, y este
-- script reparte 10 planes entre las cuentas que pongas. Para crear un plan EN VIVO,
-- usa una cuenta que NO esté en la lista (o pon 4 correos: así quedan 2-3 por cuenta).
-- ----------------------------------------------------------------------------

do $$
declare
  -- ▼ CAMBIA ESTOS CORREOS por cuentas reales del equipo (2 a 4 correos) ▼
  organizer_emails text[] := array['correo1@unbosque.edu.co', 'correo2@unbosque.edu.co'];
  -- ▲ ─────────────────────────────────────────────────────────────────── ▲
  orgs uuid[];
  today timestamptz := date_trunc('day', now() at time zone 'America/Bogota') at time zone 'America/Bogota';
  demo record;
  i int := 0;
begin
  select array_agg(p.id order by u.email) into orgs
  from auth.users u join public.profiles p on p.id = u.id
  where lower(u.email) = any (select lower(e) from unnest(organizer_emails) e)
    and p.verification_status = 'approved';

  if orgs is null or cardinality(orgs) = 0 then
    raise exception 'No encontré cuentas aprobadas con esos correos. Regístralas en la app y apruébalas primero.';
  end if;

  delete from public.plans where description like '%· Plan de demostración';

  for demo in
    select * from (values
      -- título, categoría, día (0 = hoy), hora, lugar, cupos, acceso, plazo, descripción
      ('Parche de estudio + pizza',      'estudio',      0, 18, 'Bloque C · salón 204',      10, 'open',     3,  'Repasamos para el parcial de cálculo y pedimos pizza a las 6:30.'),
      ('Fútbol 6 — nos falta uno',       'deporte',      0, 17, 'Cancha sintética',          12, 'open',     1,  'Partido amistoso, trae tenis y agua.'),
      ('Club de cine · sesión 4',        'cine',         0, 19, 'Auditorio principal',       40, 'open',     3,  'Vemos una película y la comentamos al final.'),
      ('Almuerzo para conocer gente',    'comida',       1, 12, 'Cafetería central',          6, 'open',     3,  'Mesa abierta para quien quiera almorzar acompañado.'),
      ('Jam de guitarra',                'musica',       1, 16, 'Plazoleta',                  8, 'open',     3,  'Trae tu instrumento o ven a cantar.'),
      ('Torneo de ping pong',            'juegos',       1, 15, 'Zona de bienestar',         16, 'open',     3,  'Llaves de eliminación directa, premio sorpresa.'),
      ('Voluntariado: siembra de árboles','voluntariado', 2,  9, 'Entrada principal',         20, 'approval', 24, 'Salimos juntos en bus; confirmo cupos por orden de llegada.'),
      ('Taller de acuarela',             'arte',         2, 14, 'Bloque A · laboratorio 3',   8, 'approval', 24, 'Materiales incluidos, cupos limitados.'),
      ('Caminata por los cerros',        'naturaleza',   2,  7, 'Portería norte',            12, 'open',     24, 'Ruta fácil de 2 horas. Lleva gorra y bloqueador.'),
      ('Noche de juegos de mesa',        'juegos',       0, 20, 'Cafetería central',         10, 'open',     3,  'Catan, Uno y lo que traigas.')
    ) as t(title, category, day_offset, hour, place, capacity, access, cancel_hours, descr)
  loop
    -- Solo planes en el futuro (si la hora de hoy ya pasó, se corre a mañana).
    insert into public.plans (campus_id, organizer_id, title, description, category, starts_at, place, capacity, cancel_hours, access, pinned_message)
    select p.campus_id, p.id, demo.title, demo.descr || ' · Plan de demostración', demo.category,
           case when today + make_interval(days => demo.day_offset, hours => demo.hour) > now() + interval '30 minutes'
                then today + make_interval(days => demo.day_offset, hours => demo.hour)
                else today + make_interval(days => demo.day_offset + 1, hours => demo.hour) end,
           demo.place, demo.capacity, demo.cancel_hours, demo.access::public.plan_access,
           lpad(demo.hour::text, 2, '0') || ':00 · ' || demo.place
    from public.profiles p
    where p.id = orgs[1 + (i % cardinality(orgs))];
    i := i + 1;
  end loop;

  raise notice 'Listo: % planes de demostración creados.', i;
end $$;

-- Para borrar los datos de demo después de la presentación:
-- delete from public.plans where description like '%· Plan de demostración';
