-- Junto · esquema inicial (MVP Eventos)
-- Principio: el servidor decide. RLS activado en TODAS las tablas; los clientes solo
-- leen/escriben directamente sus propias filas. Todo lo que cruza datos entre personas
-- pasa por funciones RPC (security definer, search_path vacío) que validan campus,
-- verificación, bloqueos, cupos, plazos y límites de uso.
-- Ver SECURITY.md §3 (límites de confianza).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────────────────────

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  email_domain text not null unique check (email_domain = lower(email_domain)),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.verification_status as enum ('pending_upload', 'in_review', 'approved', 'rejected');
create type public.profile_visibility as enum ('campus', 'plans');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  campus_id uuid not null references public.campuses (id),
  full_name text not null default '' check (char_length(full_name) <= 60),
  career text check (char_length(career) <= 60),
  semester smallint check (semester between 1 and 14),
  interests text[] not null default '{}' check (cardinality(interests) <= 11),
  photo_path text check (char_length(photo_path) <= 200),
  show_career boolean not null default true,
  visibility public.profile_visibility not null default 'campus',
  reminders_enabled boolean not null default true,
  -- Solo el servidor (o el equipo desde el panel) cambia lo de abajo.
  verification_status public.verification_status not null default 'pending_upload',
  rejection_reason text,
  birth_date date,
  student_code text check (char_length(student_code) <= 30),
  verification_file text,
  verification_submitted_at timestamptz,
  verified_at timestamptz,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.profiles (campus_id);

create type public.plan_access as enum ('open', 'approval');
create type public.plan_status as enum ('published', 'cancelled', 'finished');

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses (id),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 60),
  description text check (char_length(description) <= 500),
  category text not null check (category in ('estudio','deporte','musica','cine','comida','fiesta','voluntariado','juegos','arte','naturaleza','cultura')),
  starts_at timestamptz not null,
  place text not null check (char_length(place) between 2 and 80),
  capacity smallint not null check (capacity between 2 and 50),
  cancel_hours smallint not null default 3 check (cancel_hours in (1, 3, 24)),
  access public.plan_access not null default 'open',
  status public.plan_status not null default 'published',
  pinned_message text check (char_length(pinned_message) <= 200),
  photo_path text check (char_length(photo_path) <= 200),
  finished_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.plans (campus_id, starts_at);
create index on public.plans (organizer_id);

create type public.member_status as enum ('joined', 'pending', 'rejected', 'cancelled');

create table public.plan_members (
  plan_id uuid not null references public.plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.member_status not null,
  attendance_code char(4),
  arrived_at timestamptz,
  checked_in_at timestamptz,
  cancel_reason text check (char_length(cancel_reason) <= 60),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan_id, user_id),
  unique (plan_id, attendance_code)
);
create index on public.plan_members (user_id);

create table public.messages (
  id bigint generated always as identity primary key,
  plan_id uuid not null references public.plans (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  kind text not null default 'user' check (kind in ('user', 'system')),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.messages (plan_id, created_at desc);

create table public.ratings (
  plan_id uuid not null references public.plans (id) on delete cascade,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  liked_user_ids uuid[] not null default '{}' check (cardinality(liked_user_ids) <= 50),
  created_at timestamptz not null default now(),
  primary key (plan_id, rater_id)
);

create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('plan', 'user', 'message')),
  target_id text not null check (char_length(target_id) <= 60),
  reason text not null check (reason in ('acoso','falso','peligro','spam','no_estudiante','otro')),
  details text check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.saved_plans (
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);

create table public.plan_waitlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);

create table public.module_interest (
  user_id uuid not null references public.profiles (id) on delete cascade,
  module text not null check (module in ('wheels', 'tours', 'feed')),
  created_at timestamptz not null default now(),
  primary key (user_id, module)
);

-- Registro de intentos para límites de uso (check-in, mensajes, reportes, planes).
create table private.rate_events (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  action text not null,
  scope text,
  created_at timestamptz not null default now()
);
create index on private.rate_events (user_id, action, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS: activado en todas. Acceso directo solo a filas propias.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.campuses enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_members enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.saved_plans enable row level security;
alter table public.plan_waitlist enable row level security;
alter table public.module_interest enable row level security;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

-- Perfil propio: leer todo; editar solo columnas de perfil (no verificación ni campus).
create policy "leo mi perfil" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "edito mi perfil" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
grant select on public.profiles to authenticated;
grant update (full_name, career, semester, interests, photo_path, show_career, visibility, reminders_enabled) on public.profiles to authenticated;

-- Mensajes: la política de lectura (necesaria para Realtime) se crea más abajo,
-- cuando existe private.is_member().
grant select on public.messages to authenticated;

-- Membresías: cada quien ve las suyas (sin el código: va por RPC).
create policy "veo mis membresias" on public.plan_members for select to authenticated using (user_id = (select auth.uid()));
grant select (plan_id, user_id, status, arrived_at, checked_in_at, joined_at) on public.plan_members to authenticated;

-- Bloqueos, guardados, listas de espera e intereses: solo los propios.
create policy "mis bloqueos" on public.blocks for select to authenticated using (blocker_id = (select auth.uid()));
grant select on public.blocks to authenticated;
create policy "mis guardados" on public.saved_plans for select to authenticated using (user_id = (select auth.uid()));
grant select on public.saved_plans to authenticated;
create policy "mis avisos de plan" on public.plan_waitlist for select to authenticated using (user_id = (select auth.uid()));
grant select on public.plan_waitlist to authenticated;
create policy "mis avisos de modulo" on public.module_interest for select to authenticated using (user_id = (select auth.uid()));
grant select on public.module_interest to authenticated;

-- campuses, plans, ratings, reports: sin acceso directo (solo vía RPC).

-- ─────────────────────────────────────────────────────────────────────────────
-- Alta de usuario: solo correos de un campus abierto. El campus sale del dominio
-- verificado por Supabase Auth, nunca del cliente.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_domain text := lower(split_part(new.email, '@', 2));
  v_campus uuid;
begin
  select id into v_campus from public.campuses where email_domain = v_domain and is_open;
  if v_campus is null then
    raise exception 'DOMAIN_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  insert into public.profiles (id, campus_id) values (new.id, v_campus);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Ayudantes privados
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.me()
returns public.profiles
language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles;
begin
  select * into r from public.profiles where id = auth.uid();
  if r.id is null then raise exception 'UNAUTHENTICATED' using errcode = 'P0001'; end if;
  return r;
end;
$$;

create or replace function private.require_approved()
returns public.profiles
language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if r.verification_status <> 'approved' then raise exception 'NOT_VERIFIED' using errcode = 'P0001'; end if;
  return r;
end;
$$;

create or replace function private.blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Estado efectivo: un plan publicado que empezó hace más de 6 h se considera terminado.
create or replace function private.effective_status(p public.plans)
returns text language sql stable set search_path = ''
as $$
  select case
    when p.status = 'published' and p.starts_at < now() - interval '6 hours' then 'finished'
    else p.status::text
  end;
$$;

create or replace function private.can_see_plan(p public.plans, uid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p.campus_id = (select campus_id from public.profiles where id = uid)
    and not private.blocked_between(p.organizer_id, uid)
    and (
      p.status <> 'cancelled'
      or p.organizer_id = uid
      or exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = uid)
    );
$$;

create or replace function private.joined_count(p_plan uuid)
returns int language sql stable security definer set search_path = ''
as $$
  select count(*)::int from public.plan_members where plan_id = p_plan and status = 'joined';
$$;

-- Calificación como organizador: promedio de calificaciones ya reveladas (doble ciego:
-- se revelan cuando el plan terminó hace 3 días o cuando calificaron todos los asistentes).
create or replace function private.organizer_rating(p_user uuid)
returns numeric language sql stable security definer set search_path = ''
as $$
  select round(avg(r.stars)::numeric, 1)
  from public.ratings r
  join public.plans p on p.id = r.plan_id
  where p.organizer_id = p_user
    and r.rater_id <> p_user
    and (
      coalesce(p.finished_at, p.starts_at + interval '6 hours') < now() - interval '3 days'
      or (select count(*) from public.ratings r2 where r2.plan_id = p.id and r2.rater_id <> p_user)
         >= (select count(*) from public.plan_members m where m.plan_id = p.id and m.checked_in_at is not null)
    );
$$;

create or replace function private.person(p_user uuid, viewer uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', pr.id,
    'name', case when pr.full_name = '' then 'Estudiante' else pr.full_name end,
    'photo', pr.photo_path,
    'career', case when pr.show_career or pr.id = viewer then pr.career end,
    'semester', case when pr.show_career or pr.id = viewer then pr.semester end,
    'verified', pr.verification_status = 'approved'
  )
  from public.profiles pr where pr.id = p_user;
$$;

create or replace function private.rate_limit(p_action text, p_max int, p_window interval, p_scope text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  select count(*) into n from private.rate_events
  where user_id = auth.uid() and action = p_action
    and (p_scope is null or scope = p_scope)
    and created_at > now() - p_window;
  if n >= p_max then raise exception 'RATE_LIMITED' using errcode = 'P0001'; end if;
  insert into private.rate_events (user_id, action, scope) values (auth.uid(), p_action, p_scope);
end;
$$;

create or replace function private.plan_card(p public.plans, viewer uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'title', p.title,
    'description', p.description,
    'category', p.category,
    'startsAt', p.starts_at,
    'place', p.place,
    'capacity', p.capacity,
    'joined', private.joined_count(p.id),
    'cancelHours', p.cancel_hours,
    'access', p.access,
    'status', private.effective_status(p),
    'photo', p.photo_path,
    'pinned', p.pinned_message,
    'organizer', private.person(p.organizer_id, viewer),
    'organizerRating', private.organizer_rating(p.organizer_id),
    'isOrganizer', p.organizer_id = viewer,
    'myStatus', (select m.status from public.plan_members m where m.plan_id = p.id and m.user_id = viewer),
    'saved', exists (select 1 from public.saved_plans s where s.plan_id = p.id and s.user_id = viewer)
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: verificación y cuenta
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.get_me()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  return jsonb_build_object(
    'id', r.id,
    'fullName', r.full_name,
    'career', r.career,
    'semester', r.semester,
    'interests', r.interests,
    'photo', r.photo_path,
    'showCareer', r.show_career,
    'visibility', r.visibility,
    'remindersEnabled', r.reminders_enabled,
    'verification', r.verification_status,
    'rejectionReason', r.rejection_reason,
    'consented', r.consent_at is not null,
    'campus', (select jsonb_build_object('id', c.id, 'name', c.name, 'shortName', c.short_name) from public.campuses c where c.id = r.campus_id),
    'stats', jsonb_build_object(
      'plans', (select count(*) from public.plans p where p.organizer_id = r.id and p.status <> 'cancelled'),
      'attended', (select count(*) from public.plan_members m where m.user_id = r.id and m.checked_in_at is not null),
      'rating', private.organizer_rating(r.id)
    )
  );
end;
$$;

create or replace function public.record_consent()
returns void language sql security definer set search_path = ''
as $$
  update public.profiles set consent_at = coalesce(consent_at, now()) where id = auth.uid();
$$;

-- Envía el carné a revisión. Regla 18+ también en el servidor.
create or replace function public.submit_verification(p_birth_date date, p_student_code text, p_file_path text)
returns void language plpgsql security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if r.verification_status = 'approved' then raise exception 'ALREADY_VERIFIED' using errcode = 'P0001'; end if;
  if p_birth_date is null or p_birth_date > (current_date - interval '18 years')::date or p_birth_date < date '1930-01-01' then
    raise exception 'UNDERAGE' using errcode = 'P0001';
  end if;
  if p_file_path is null or p_file_path not like r.id::text || '/%' then
    raise exception 'BAD_FILE' using errcode = 'P0001';
  end if;
  if char_length(coalesce(p_student_code, '')) not between 3 and 30 then
    raise exception 'BAD_STUDENT_CODE' using errcode = 'P0001';
  end if;
  update public.profiles set
    birth_date = p_birth_date,
    student_code = trim(p_student_code),
    verification_file = p_file_path,
    verification_status = 'in_review',
    rejection_reason = null,
    verification_submitted_at = now()
  where id = r.id;
end;
$$;

create or replace function public.export_my_data()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  return jsonb_build_object(
    'perfil', to_jsonb(r) - 'verification_file',
    'planes_creados', (select coalesce(jsonb_agg(to_jsonb(p)), '[]') from public.plans p where p.organizer_id = r.id),
    'inscripciones', (select coalesce(jsonb_agg(to_jsonb(m) - 'attendance_code'), '[]') from public.plan_members m where m.user_id = r.id),
    'mensajes', (select coalesce(jsonb_agg(jsonb_build_object('plan', x.plan_id, 'texto', x.body, 'fecha', x.created_at)), '[]') from public.messages x where x.user_id = r.id),
    'calificaciones', (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.ratings t where t.rater_id = r.id),
    'reportes', (select coalesce(jsonb_agg(to_jsonb(t)), '[]') from public.reports t where t.reporter_id = r.id),
    'bloqueos', (select coalesce(jsonb_agg(t.blocked_id), '[]') from public.blocks t where t.blocker_id = r.id),
    'exportado', now()
  );
end;
$$;

-- Borra la cuenta y todo lo asociado (cascada desde auth.users).
-- Los archivos en Storage los borra la app antes de llamar a esta función.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'UNAUTHENTICATED' using errcode = 'P0001'; end if;
  -- Los planes futuros que organizaba quedan cancelados para avisar a los inscritos.
  update public.plans set status = 'cancelled', cancelled_at = now()
    where organizer_id = uid and status = 'published' and starts_at > now();
  delete from auth.users where id = uid;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: lectura de planes
-- ─────────────────────────────────────────────────────────────────────────────

-- Feed: planes futuros del campus, con cupo, que no son míos ni a los que ya me uní.
create or replace function public.get_feed(p_category text default null, p_limit int default 30)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  return coalesce((
    select jsonb_agg(private.plan_card(p, r.id) order by p.starts_at)
    from (
      select p.* from public.plans p
      where p.campus_id = r.campus_id
        and p.status = 'published'
        and p.starts_at > now()
        and p.organizer_id <> r.id
        and not private.blocked_between(p.organizer_id, r.id)
        and not exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status in ('joined', 'pending'))
        and private.joined_count(p.id) < p.capacity
        and (p_category is null or p.category = p_category)
      order by p.starts_at
      limit least(greatest(p_limit, 1), 50)
    ) p
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_plan(p_plan_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  r public.profiles := private.me();
  p public.plans;
begin
  select * into p from public.plans where id = p_plan_id;
  if p.id is null or not private.can_see_plan(p, r.id) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  return private.plan_card(p, r.id) || jsonb_build_object(
    'attendees', coalesce((
      select jsonb_agg(private.person(m.user_id, r.id) order by m.joined_at)
      from (select * from public.plan_members m
            where m.plan_id = p.id and m.status = 'joined' and not private.blocked_between(m.user_id, r.id)
            order by m.joined_at limit 12) m
    ), '[]'::jsonb),
    'pendingCount', case when p.organizer_id = r.id then (select count(*) from public.plan_members m where m.plan_id = p.id and m.status = 'pending') end,
    'arrived', (select m.arrived_at is not null from public.plan_members m where m.plan_id = p.id and m.user_id = r.id),
    'checkedIn', (select m.checked_in_at is not null from public.plan_members m where m.plan_id = p.id and m.user_id = r.id),
    'rated', exists (select 1 from public.ratings t where t.plan_id = p.id and t.rater_id = r.id),
    'onWaitlist', exists (select 1 from public.plan_waitlist w where w.plan_id = p.id and w.user_id = r.id)
  );
end;
$$;

-- Inicio: mi próximo plan, cuántos planes hay hoy en el campus y los de hoy.
create or replace function public.get_home()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  return jsonb_build_object(
    'next', (
      select private.plan_card(p, r.id) from public.plans p
      where p.status = 'published' and p.starts_at > now() - interval '3 hours'
        and (p.organizer_id = r.id or exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status = 'joined'))
      order by p.starts_at limit 1
    ),
    'todayCount', (
      select count(*) from public.plans p
      where p.campus_id = r.campus_id and p.status = 'published'
        and p.starts_at > now()
        and (p.starts_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
        and not private.blocked_between(p.organizer_id, r.id)
    ),
    'today', coalesce((
      select jsonb_agg(private.plan_card(p, r.id) order by p.starts_at) from (
        select p.* from public.plans p
        where p.campus_id = r.campus_id and p.status = 'published'
          and p.starts_at > now()
          and (p.starts_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
          and not private.blocked_between(p.organizer_id, r.id)
        order by p.starts_at limit 3
      ) p
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.get_my_plans(p_tab text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if p_tab not in ('upcoming', 'organizing', 'past') then raise exception 'BAD_TAB' using errcode = 'P0001'; end if;
  return coalesce((
    select jsonb_agg(private.plan_card(p, r.id) order by
      case when p_tab = 'past' then null else p.starts_at end asc,
      case when p_tab = 'past' then p.starts_at end desc)
    from public.plans p
    where case p_tab
      when 'upcoming' then
        private.effective_status(p) = 'published'
        and exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status in ('joined', 'pending'))
      when 'organizing' then
        p.organizer_id = r.id and private.effective_status(p) = 'published'
      else
        (private.effective_status(p) in ('finished', 'cancelled'))
        and (p.organizer_id = r.id or exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status = 'joined'))
    end
  ), '[]'::jsonb);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: crear y gestionar planes (organizador)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.create_plan(
  p_title text, p_category text, p_starts_at timestamptz, p_place text, p_capacity int,
  p_cancel_hours int, p_access public.plan_access, p_description text default null, p_photo_path text default null
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  r public.profiles := private.require_approved();
  v_id uuid;
begin
  perform private.rate_limit('create_plan', 10, interval '1 day');
  if (select count(*) from public.plans where organizer_id = r.id and status = 'published' and starts_at > now()) >= 3 then
    raise exception 'TOO_MANY_ACTIVE_PLANS' using errcode = 'P0001';
  end if;
  if p_starts_at < now() + interval '15 minutes' or p_starts_at > now() + interval '60 days' then
    raise exception 'BAD_DATE' using errcode = 'P0001';
  end if;
  if p_photo_path is not null and p_photo_path not like r.id::text || '/%' then
    raise exception 'BAD_FILE' using errcode = 'P0001';
  end if;
  insert into public.plans (campus_id, organizer_id, title, description, category, starts_at, place, capacity, cancel_hours, access, photo_path, pinned_message)
  values (r.campus_id, r.id, trim(p_title), nullif(trim(p_description), ''), p_category, p_starts_at, trim(p_place), p_capacity, p_cancel_hours, p_access, p_photo_path,
          to_char(p_starts_at at time zone 'America/Bogota', 'HH12:MI am') || ' · ' || trim(p_place))
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.set_pinned_message(p_plan_id uuid, p_text text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.plans set pinned_message = nullif(trim(p_text), '')
  where id = p_plan_id and organizer_id = auth.uid() and status = 'published';
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.cancel_plan(p_plan_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.plans set status = 'cancelled', cancelled_at = now()
  where id = p_plan_id and organizer_id = auth.uid() and status = 'published';
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  insert into public.messages (plan_id, user_id, kind, body) values (p_plan_id, null, 'system', 'El organizador canceló el plan.');
end;
$$;

create or replace function public.finish_plan(p_plan_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.plans set status = 'finished', finished_at = now()
  where id = p_plan_id and organizer_id = auth.uid() and status = 'published' and starts_at < now() + interval '1 hour';
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.get_requests(p_plan_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if not exists (select 1 from public.plans where id = p_plan_id and organizer_id = uid) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return coalesce((
    select jsonb_agg(private.person(m.user_id, uid) || jsonb_build_object('status', m.status, 'checkedIn', m.checked_in_at is not null) order by m.joined_at)
    from public.plan_members m where m.plan_id = p_plan_id and m.status in ('pending', 'joined', 'rejected')
  ), '[]'::jsonb);
end;
$$;

create or replace function private.new_code(p_plan uuid)
returns char(4) language plpgsql security definer set search_path = ''
as $$
declare c char(4);
begin
  loop
    c := lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.plan_members where plan_id = p_plan and attendance_code = c);
  end loop;
  return c;
end;
$$;

create or replace function public.respond_request(p_plan_id uuid, p_user_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare p public.plans;
begin
  select * into p from public.plans where id = p_plan_id and organizer_id = auth.uid() for update;
  if p.id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if p_accept and private.joined_count(p.id) >= p.capacity then raise exception 'FULL' using errcode = 'P0001'; end if;
  update public.plan_members
    set status = case when p_accept then 'joined'::public.member_status else 'rejected'::public.member_status end,
        attendance_code = case when p_accept then private.new_code(p.id) end,
        updated_at = now()
  where plan_id = p.id and user_id = p_user_id and status = 'pending';
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

-- Validar asistencia: el organizador escribe el código que le muestra el asistente.
create or replace function public.check_in(p_plan_id uuid, p_code text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  p public.plans;
  v_user uuid;
begin
  select * into p from public.plans where id = p_plan_id and organizer_id = auth.uid();
  if p.id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if now() < p.starts_at - interval '1 hour' or private.effective_status(p) <> 'published' then
    raise exception 'NOT_IN_WINDOW' using errcode = 'P0001';
  end if;
  perform private.rate_limit('check_in', 5, interval '1 minute', p_plan_id::text);
  update public.plan_members set checked_in_at = coalesce(checked_in_at, now()), updated_at = now()
  where plan_id = p.id and status = 'joined' and attendance_code = p_code
  returning user_id into v_user;
  if v_user is null then raise exception 'BAD_CODE' using errcode = 'P0001'; end if;
  return private.person(v_user, auth.uid());
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: asistente
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.join_plan(p_plan_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  r public.profiles := private.require_approved();
  p public.plans;
  v_status public.member_status;
begin
  select * into p from public.plans where id = p_plan_id for update;
  if p.id is null or not private.can_see_plan(p, r.id) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if p.organizer_id = r.id then raise exception 'OWN_PLAN' using errcode = 'P0001'; end if;
  if p.status <> 'published' or p.starts_at < now() then raise exception 'CLOSED' using errcode = 'P0001'; end if;
  if exists (select 1 from public.plan_members where plan_id = p.id and user_id = r.id and status in ('joined', 'pending')) then
    return jsonb_build_object('status', (select status from public.plan_members where plan_id = p.id and user_id = r.id));
  end if;
  if private.joined_count(p.id) >= p.capacity then return jsonb_build_object('status', 'full'); end if;
  v_status := case when p.access = 'open' then 'joined' else 'pending' end;
  insert into public.plan_members (plan_id, user_id, status, attendance_code)
  values (p.id, r.id, v_status, case when v_status = 'joined' then private.new_code(p.id) end)
  on conflict (plan_id, user_id) do update
    set status = excluded.status, attendance_code = excluded.attendance_code, cancel_reason = null, joined_at = now(), updated_at = now();
  delete from public.plan_waitlist where plan_id = p.id and user_id = r.id;
  return jsonb_build_object('status', v_status);
end;
$$;

-- Cancelar dentro del plazo. Fuera del plazo no se cancela: se avisa en el chat.
create or replace function public.cancel_attendance(p_plan_id uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare p public.plans;
begin
  select * into p from public.plans where id = p_plan_id;
  if p.id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if now() > p.starts_at - make_interval(hours => p.cancel_hours) then
    -- Las solicitudes pendientes sí se pueden retirar en cualquier momento.
    if not exists (select 1 from public.plan_members where plan_id = p.id and user_id = auth.uid() and status = 'pending') then
      raise exception 'CANCEL_CLOSED' using errcode = 'P0001';
    end if;
  end if;
  update public.plan_members
    set status = 'cancelled', attendance_code = null, cancel_reason = left(p_reason, 60), updated_at = now()
  where plan_id = p.id and user_id = auth.uid() and status in ('joined', 'pending');
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.get_my_code(p_plan_id uuid)
returns text language sql stable security definer set search_path = ''
as $$
  select attendance_code from public.plan_members
  where plan_id = p_plan_id and user_id = auth.uid() and status = 'joined';
$$;

create or replace function public.mark_arrived(p_plan_id uuid, p_late boolean default false)
returns void language plpgsql security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  perform private.rate_limit('arrive', 6, interval '10 minutes', p_plan_id::text);
  if not exists (select 1 from public.plan_members where plan_id = p_plan_id and user_id = r.id and status = 'joined') then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if not p_late then
    update public.plan_members set arrived_at = coalesce(arrived_at, now()) where plan_id = p_plan_id and user_id = r.id;
  end if;
  insert into public.messages (plan_id, user_id, kind, body)
  values (p_plan_id, r.id, 'system',
          coalesce(nullif(r.full_name, ''), 'Alguien') || case when p_late then ' va un poco tarde.' else ' ya llegó.' end);
end;
$$;

create or replace function public.rate_plan(p_plan_id uuid, p_stars int, p_liked uuid[] default '{}')
returns void language plpgsql security definer set search_path = ''
as $$
declare p public.plans;
begin
  select * into p from public.plans where id = p_plan_id;
  if p.id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if private.effective_status(p) <> 'finished' and not (p.status = 'published' and p.starts_at < now()) then
    raise exception 'NOT_FINISHED' using errcode = 'P0001';
  end if;
  if p.organizer_id <> auth.uid() and not exists (
    select 1 from public.plan_members where plan_id = p.id and user_id = auth.uid() and status = 'joined'
  ) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  insert into public.ratings (plan_id, rater_id, stars, liked_user_ids)
  values (p.id, auth.uid(), p_stars,
          coalesce((select array_agg(u) from unnest(p_liked) u
                    where u <> auth.uid() and exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = u and m.status = 'joined')), '{}'))
  on conflict (plan_id, rater_id) do nothing;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: chat
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.is_member(p_plan uuid, uid uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.plan_members where plan_id = p_plan and user_id = uid and status = 'joined')
      or exists (select 1 from public.plans where id = p_plan and organizer_id = uid);
$$;

-- Lectura directa del chat (Realtime) solo para miembros confirmados y el organizador,
-- y nunca mensajes de alguien bloqueado.
create policy "miembros leen el chat" on public.messages for select to authenticated using (
  private.is_member(plan_id, (select auth.uid()))
  and (user_id is null or not private.blocked_between(user_id, (select auth.uid())))
);

create or replace function public.get_messages(p_plan_id uuid, p_before bigint default null)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare uid uuid := auth.uid();
begin
  if not private.is_member(p_plan_id, uid) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', x.id, 'kind', x.kind, 'body', x.body, 'createdAt', x.created_at, 'mine', x.user_id = uid,
      'author', case when x.user_id is null then null else private.person(x.user_id, uid) end
    ) order by x.id)
    from (
      select * from public.messages x
      where x.plan_id = p_plan_id
        and (p_before is null or x.id < p_before)
        and (x.user_id is null or not private.blocked_between(x.user_id, uid))
      order by x.id desc limit 50
    ) x
  ), '[]'::jsonb);
end;
$$;

create or replace function public.send_message(p_plan_id uuid, p_body text)
returns bigint language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_id bigint;
begin
  if not private.is_member(p_plan_id, uid) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  if (select status from public.plans where id = p_plan_id) = 'cancelled' then raise exception 'CLOSED' using errcode = 'P0001'; end if;
  perform private.rate_limit('message', 20, interval '1 minute');
  insert into public.messages (plan_id, user_id, body) values (p_plan_id, uid, trim(p_body)) returning id into v_id;
  return v_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: seguridad del usuario
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.report(p_target_type text, p_target_id text, p_reason text, p_details text default null)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  perform private.me();
  perform private.rate_limit('report', 10, interval '1 day');
  insert into public.reports (reporter_id, target_type, target_id, reason, details)
  values (auth.uid(), p_target_type, p_target_id, p_reason, nullif(trim(p_details), ''));
end;
$$;

create or replace function public.block_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_user_id = auth.uid() then raise exception 'SELF' using errcode = 'P0001'; end if;
  insert into public.blocks (blocker_id, blocked_id) values (auth.uid(), p_user_id) on conflict do nothing;
end;
$$;

create or replace function public.unblock_user(p_user_id uuid)
returns void language sql security definer set search_path = ''
as $$
  delete from public.blocks where blocker_id = auth.uid() and blocked_id = p_user_id;
$$;

create or replace function public.get_blocked()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(private.person(b.blocked_id, auth.uid()) order by b.created_at desc), '[]'::jsonb)
  from public.blocks b where b.blocker_id = auth.uid();
$$;

create or replace function public.toggle_saved(p_plan_id uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  if exists (select 1 from public.saved_plans where user_id = auth.uid() and plan_id = p_plan_id) then
    delete from public.saved_plans where user_id = auth.uid() and plan_id = p_plan_id;
    return false;
  end if;
  if not private.can_see_plan((select p from public.plans p where p.id = p_plan_id), auth.uid()) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.saved_plans (user_id, plan_id) values (auth.uid(), p_plan_id);
  return true;
end;
$$;

create or replace function public.set_plan_waitlist(p_plan_id uuid, p_on boolean)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_on then
    insert into public.plan_waitlist (user_id, plan_id) values (auth.uid(), p_plan_id) on conflict do nothing;
  else
    delete from public.plan_waitlist where user_id = auth.uid() and plan_id = p_plan_id;
  end if;
end;
$$;

create or replace function public.set_module_interest(p_module text, p_on boolean)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_on then
    insert into public.module_interest (user_id, module) values (auth.uid(), p_module) on conflict do nothing;
  else
    delete from public.module_interest where user_id = auth.uid() and module = p_module;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Permisos de ejecución: nada para anon; solo las RPC públicas para authenticated.
-- ─────────────────────────────────────────────────────────────────────────────

revoke execute on all functions in schema public from public, anon;
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on all functions in schema public to authenticated;
-- Las RPC llaman a los ayudantes privados con los permisos del dueño (security definer).
-- La política del chat evalúa con los permisos del usuario: solo esos dos ayudantes.
-- El esquema private no está expuesto por la API, así que esto no los publica.
grant usage on schema private to authenticated;
grant execute on function private.is_member(uuid, uuid) to authenticated;
grant execute on function private.blocked_between(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime del chat (respeta la política "miembros leen el chat").
-- ─────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.messages;

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage: carnés privados; fotos de perfil y de planes en bucket público con
-- rutas aleatorias bajo la carpeta del dueño.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('verifications', 'verifications', false, 10485760, array['image/jpeg', 'image/png', 'image/heic', 'application/pdf']),
  ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "subo mi carne" on storage.objects for insert to authenticated
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "borro mi carne" on storage.objects for delete to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Cada quien lista sus propios archivos (para borrarlos al eliminar la cuenta).
create policy "veo mis archivos" on storage.objects for select to authenticated
  using (bucket_id in ('verifications', 'media') and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "subo mis fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "borro mis fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- Datos base: primer campus.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.campuses (name, short_name, email_domain)
values ('Universidad El Bosque', 'El Bosque', 'unbosque.edu.co')
on conflict (email_domain) do nothing;
