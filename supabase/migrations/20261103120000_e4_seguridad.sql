-- Junto · E4 Seguridad (revisión guiada, 2026-11-03)
-- Arreglos de los hallazgos de SECURITY.md §5 y endurecimientos. Cada uno tiene su
-- prueba de regresión en supabase/tests/security.test.mjs (sección "E4").
-- Va DESPUÉS de 20261029120000_init.sql.

-- ─────────────────────────────────────────────────────────────────────────────
-- H1 [media] "Quién ve mi perfil: Solo mis planes" no se respetaba en "Quién va".
-- Quien no comparte el plan ve a esa persona como "Estudiante", sin foto ni carrera.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.attendee(p_user uuid, viewer uuid, viewer_in_plan boolean)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case
    when viewer_in_plan or pr.visibility = 'campus' or pr.id = viewer then private.person(pr.id, viewer)
    else jsonb_build_object('id', pr.id, 'name', 'Estudiante', 'photo', null, 'career', null, 'semester', null,
                            'verified', pr.verification_status = 'approved')
  end
  from public.profiles pr where pr.id = p_user;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- E1 Para ver planes hay que haber enviado el carné (en revisión o aprobado).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.require_submitted()
returns public.profiles
language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if r.verification_status not in ('in_review', 'approved') then
    raise exception 'NOT_VERIFIED' using errcode = 'P0001';
  end if;
  return r;
end;
$$;

create or replace function public.get_plan(p_plan_id uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  r public.profiles := private.require_submitted();
  p public.plans;
  v_in_plan boolean;
begin
  select * into p from public.plans where id = p_plan_id;
  if p.id is null or not private.can_see_plan(p, r.id) then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  v_in_plan := private.is_member(p.id, r.id);
  return private.plan_card(p, r.id) || jsonb_build_object(
    'attendees', coalesce((
      select jsonb_agg(private.attendee(m.user_id, r.id, v_in_plan) order by m.joined_at)
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

-- Feed: además, los planes donde me rechazaron ya no aparecen (ver H3).
create or replace function public.get_feed(p_category text default null, p_limit int default 30)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.require_submitted();
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
        and not exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status in ('joined', 'pending', 'rejected'))
        and private.joined_count(p.id) < p.capacity
        and (p_category is null or p.category = p_category)
      order by p.starts_at
      limit least(greatest(p_limit, 1), 50)
    ) p
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_home()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare r public.profiles := private.require_submitted();
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

-- ─────────────────────────────────────────────────────────────────────────────
-- H3 [baja] Tras un rechazo se podía volver a pedir cupo sin límite.
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
  if exists (select 1 from public.plan_members where plan_id = p.id and user_id = r.id and status = 'rejected') then
    raise exception 'REJECTED' using errcode = 'P0001';
  end if;
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

-- ─────────────────────────────────────────────────────────────────────────────
-- H2 [baja] Doble ciego: si nadie había validado asistencia, cada calificación se
-- revelaba al instante y el organizador podía deducir la nota de cada persona.
-- Ahora se revela a los 3 días o cuando calificaron TODOS los que llegaron (y llegó alguien).
-- ─────────────────────────────────────────────────────────────────────────────

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
      or (
        (select count(*) from public.plan_members m where m.plan_id = p.id and m.checked_in_at is not null) > 0
        and (select count(*) from public.ratings r2
             join public.plan_members m2 on m2.plan_id = r2.plan_id and m2.user_id = r2.rater_id and m2.checked_in_at is not null
             where r2.plan_id = p.id)
            >= (select count(*) from public.plan_members m where m.plan_id = p.id and m.checked_in_at is not null)
      )
    );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- E2 La foto de perfil solo puede apuntar a la carpeta propia.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "edito mi perfil" on public.profiles;
create policy "edito mi perfil" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and (photo_path is null or photo_path like id::text || '/%'));

-- ─────────────────────────────────────────────────────────────────────────────
-- E3 Cambiar el correo de la cuenta solo a otro del mismo campus.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.handle_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_campus uuid;
begin
  select c.id into v_campus from public.campuses c
  where c.email_domain = lower(split_part(new.email, '@', 2)) and c.is_open;
  if v_campus is null or v_campus is distinct from (select campus_id from public.profiles where id = new.id) then
    raise exception 'DOMAIN_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_change on auth.users;
create trigger on_auth_user_email_change
  before update of email on auth.users
  for each row
  when (old.email is distinct from new.email and new.email is not null)
  execute function private.handle_email_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- E4 El servicio de Auth de Supabase (supabase_auth_admin) ejecuta los triggers de
-- auth.users: permisos explícitos sobre el esquema privado para no depender de defaults.
-- ─────────────────────────────────────────────────────────────────────────────

grant usage on schema private to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;
grant execute on function private.handle_email_change() to supabase_auth_admin;

-- Permisos de las funciones nuevas o reemplazadas (mismo criterio que la migración inicial).
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
revoke execute on function private.attendee(uuid, uuid, boolean) from public, anon, authenticated;
revoke execute on function private.require_submitted() from public, anon, authenticated;
revoke execute on function private.handle_email_change() from public, anon, authenticated;
