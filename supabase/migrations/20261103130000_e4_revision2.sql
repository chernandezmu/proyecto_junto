-- Junto · E4 Seguridad · segunda revisión (independiente, 2026-11-03)
-- Arreglos de C1–C5 (SECURITY.md §5) y notas aplicadas. Va DESPUÉS de
-- 20261103120000_e4_seguridad.sql. Pruebas: sección "E4 · Segunda revisión".

-- ─────────────────────────────────────────────────────────────────────────────
-- C1 [media] H1 se saltaba: con el id real del asistente anónimo se podía bloquear
-- y leer su perfil completo en get_blocked (incluso desde otro campus).
-- (a) la entrada anónima ya no expone el id real; (b) solo se bloquea a gente del
-- propio campus; (c) get_blocked respeta la visibilidad.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function private.attendee(p_user uuid, viewer uuid, viewer_in_plan boolean)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case
    when viewer_in_plan or pr.visibility = 'campus' or pr.id = viewer then private.person(pr.id, viewer)
    else jsonb_build_object('id', gen_random_uuid(), 'name', 'Estudiante', 'photo', null, 'career', null, 'semester', null,
                            'verified', pr.verification_status = 'approved')
  end
  from public.profiles pr where pr.id = p_user;
$$;

create or replace function public.block_user(p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if p_user_id = r.id then raise exception 'SELF' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles where id = p_user_id and campus_id = r.campus_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.blocks (blocker_id, blocked_id) values (r.id, p_user_id) on conflict do nothing;
end;
$$;

create or replace function public.get_blocked()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(
    case when pr.visibility = 'campus' or exists (
      -- comparten (o compartieron) un plan
      select 1 from public.plan_members a join public.plan_members b on b.plan_id = a.plan_id
      where a.user_id = auth.uid() and b.user_id = pr.id
    ) or exists (
      select 1 from public.plans p join public.plan_members m on m.plan_id = p.id
      where (p.organizer_id = auth.uid() and m.user_id = pr.id) or (p.organizer_id = pr.id and m.user_id = auth.uid())
    )
    then private.person(pr.id, auth.uid())
    else jsonb_build_object('id', pr.id, 'name', 'Estudiante', 'photo', null, 'career', null, 'semester', null,
                            'verified', pr.verification_status = 'approved')
    end order by b.created_at desc), '[]'::jsonb)
  from public.blocks b join public.profiles pr on pr.id = b.blocked_id
  where b.blocker_id = auth.uid();
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C2 [baja] Doble ciego: la revelación anticipada solo cuenta notas de quien llegó
-- (asistencia validada), con el plan terminado, ≥ 2 validados y todos con nota.
-- Lo demás espera a los 3 días.
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
        private.effective_status(p) = 'finished'
        and exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.rater_id and m.checked_in_at is not null)
        and (select count(*) from public.plan_members m where m.plan_id = p.id and m.checked_in_at is not null) >= 2
        and not exists (select 1 from public.plan_members m where m.plan_id = p.id and m.checked_in_at is not null
                          and not exists (select 1 from public.ratings r2 where r2.plan_id = p.id and r2.rater_id = m.user_id))
      )
    );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C3 [baja] El límite de check_in no contaba los fallos (el raise deshacía el contador).
-- Un código incorrecto ahora devuelve {"error":"BAD_CODE"} y el intento queda contado.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.check_in(p_plan_id uuid, p_code text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare p public.plans; v_user uuid;
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
  if v_user is null then return jsonb_build_object('error', 'BAD_CODE'); end if;
  return private.person(v_user, auth.uid());
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- C4 [baja] E1 se saltaba con una ruta inventada: ahora el archivo tiene que existir
-- en el bucket privado y ser del propio usuario. Máximo 3 envíos al día.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.submit_verification(p_birth_date date, p_student_code text, p_file_path text)
returns void language plpgsql security definer set search_path = ''
as $$
declare r public.profiles := private.me();
begin
  if r.verification_status = 'approved' then raise exception 'ALREADY_VERIFIED' using errcode = 'P0001'; end if;
  if p_birth_date is null or p_birth_date > (current_date - interval '18 years')::date or p_birth_date < date '1930-01-01' then
    raise exception 'UNDERAGE' using errcode = 'P0001';
  end if;
  if p_file_path is null or p_file_path not like r.id::text || '/%'
     or not exists (select 1 from storage.objects o
                    where o.bucket_id = 'verifications' and o.name = p_file_path and o.owner_id = r.id::text) then
    raise exception 'BAD_FILE' using errcode = 'P0001';
  end if;
  if char_length(coalesce(p_student_code, '')) not between 3 and 30 then
    raise exception 'BAD_STUDENT_CODE' using errcode = 'P0001';
  end if;
  perform private.rate_limit('verify', 3, interval '1 day');
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

-- ─────────────────────────────────────────────────────────────────────────────
-- C5 [baja] "Ya llegué" / "Voy tarde" se guardaban como mensaje de sistema con el
-- nombre del usuario (suplantable). Ahora son mensajes normales del autor (con su
-- nombre visible y opción de reportar), solo en planes publicados y desde 2 h antes.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.mark_arrived(p_plan_id uuid, p_late boolean default false)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  r public.profiles := private.me();
  p public.plans;
begin
  select * into p from public.plans where id = p_plan_id;
  if p.id is null or not exists (select 1 from public.plan_members where plan_id = p.id and user_id = r.id and status = 'joined') then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if private.effective_status(p) <> 'published' or now() < p.starts_at - interval '2 hours' then
    raise exception 'CLOSED' using errcode = 'P0001';
  end if;
  perform private.rate_limit('arrive', 6, interval '10 minutes', p_plan_id::text);
  if not p_late then
    update public.plan_members set arrived_at = coalesce(arrived_at, now()) where plan_id = p.id and user_id = r.id;
  end if;
  insert into public.messages (plan_id, user_id, kind, body)
  values (p.id, r.id, 'user', case when p_late then 'Voy un poco tarde.' else 'Ya llegué al punto de encuentro.' end);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Notas aplicadas
-- ─────────────────────────────────────────────────────────────────────────────

-- Dominio del correo: lo que va después de la ÚLTIMA @ (correos con varias @).
create or replace function private.email_domain(p_email text)
returns text language sql immutable set search_path = ''
as $$ select substring(lower(p_email) from '@([^@]+)$') $$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_campus uuid;
begin
  select id into v_campus from public.campuses where email_domain = private.email_domain(new.email) and is_open;
  if v_campus is null then
    raise exception 'DOMAIN_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  insert into public.profiles (id, campus_id) values (new.id, v_campus);
  return new;
end;
$$;

create or replace function private.handle_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_campus uuid;
begin
  select c.id into v_campus from public.campuses c
  where c.email_domain = private.email_domain(new.email) and c.is_open;
  if v_campus is null or v_campus is distinct from (select campus_id from public.profiles where id = new.id) then
    raise exception 'DOMAIN_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- "Hoy en tu campus" de Inicio tampoco muestra planes donde me rechazaron (H3).
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
        and not exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status = 'rejected')
    ),
    'today', coalesce((
      select jsonb_agg(private.plan_card(p, r.id) order by p.starts_at) from (
        select p.* from public.plans p
        where p.campus_id = r.campus_id and p.status = 'published'
          and p.starts_at > now()
          and (p.starts_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
          and not private.blocked_between(p.organizer_id, r.id)
          and not exists (select 1 from public.plan_members m where m.plan_id = p.id and m.user_id = r.id and m.status = 'rejected')
        order by p.starts_at limit 3
      ) p
    ), '[]'::jsonb)
  );
end;
$$;

-- Terminar un plan solo cuando ya empezó (antes era desde 1 h antes: cancelación sin aviso
-- y calificaciones de un plan que no ocurrió).
create or replace function public.finish_plan(p_plan_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.plans set status = 'finished', finished_at = now()
  where id = p_plan_id and organizer_id = auth.uid() and status = 'published' and starts_at <= now();
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

-- Lista de espera solo para planes que puedo ver.
create or replace function public.set_plan_waitlist(p_plan_id uuid, p_on boolean)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if p_on then
    if not coalesce(private.can_see_plan((select p from public.plans p where p.id = p_plan_id), auth.uid()), false) then
      raise exception 'NOT_FOUND' using errcode = 'P0001';
    end if;
    insert into public.plan_waitlist (user_id, plan_id) values (auth.uid(), p_plan_id) on conflict do nothing;
  else
    delete from public.plan_waitlist where user_id = auth.uid() and plan_id = p_plan_id;
  end if;
end;
$$;

-- Permisos (mismo criterio que las migraciones anteriores).
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;
revoke execute on function private.email_domain(text) from public, anon, authenticated;
grant execute on function private.email_domain(text) to supabase_auth_admin;
grant execute on function private.handle_new_user() to supabase_auth_admin;
grant execute on function private.handle_email_change() to supabase_auth_admin;
