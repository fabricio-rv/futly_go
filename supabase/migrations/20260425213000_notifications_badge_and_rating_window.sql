-- Notifications backfill + rating availability by match end time.

create or replace function public.match_has_ended(p_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and now() >= (m.match_date::timestamp + m.match_time + make_interval(mins => m.duration_minutes))
      and m.status <> 'cancelada'
  );
$$;

grant execute on function public.match_has_ended(uuid) to authenticated;

create or replace function public.validate_rating_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches%rowtype;
  v_reviewer_is_confirmed boolean;
  v_reviewed_is_confirmed boolean;
begin
  select * into v_match
  from public.matches m
  where m.id = new.match_id;

  if v_match.id is null then
    raise exception 'Match not found.';
  end if;

  if not public.match_has_ended(new.match_id) then
    raise exception 'Ratings are available only after match end time.';
  end if;

  if new.reviewer_id <> auth.uid() then
    raise exception 'Reviewer must be current authenticated user.';
  end if;

  select exists (
    select 1
    from public.match_participants mp
    where mp.match_id = new.match_id
      and mp.user_id = new.reviewer_id
      and mp.status = 'confirmado'
  ) into v_reviewer_is_confirmed;

  if not v_reviewer_is_confirmed and new.reviewer_id <> v_match.created_by then
    raise exception 'Only confirmed participants or host can rate.';
  end if;

  if new.target_role = 'creator' then
    if new.reviewed_id <> v_match.created_by then
      raise exception 'Creator rating target must be the match host.';
    end if;

    if new.reviewer_id = v_match.created_by then
      raise exception 'Host cannot rate themselves.';
    end if;
  else
    if new.reviewer_id <> v_match.created_by then
      raise exception 'Only host can rate players.';
    end if;

    select exists (
      select 1
      from public.match_participants mp
      where mp.match_id = new.match_id
        and mp.user_id = new.reviewed_id
        and mp.status = 'confirmado'
        and mp.is_host = false
    ) into v_reviewed_is_confirmed;

    if not v_reviewed_is_confirmed then
      raise exception 'Reviewed player must be a confirmed non-host participant.';
    end if;
  end if;

  return new;
end;
$$;

create or replace view public.match_rating_tasks
with (security_invoker = true)
as
select
  concat('creator:', m.id::text, ':', p.id::text) as task_id,
  m.id as match_id,
  m.title as match_title,
  m.match_date,
  p.id as target_user_id,
  p.full_name as target_user_name,
  'player'::public.rating_target_role as target_role,
  'Avaliar jogador'::text as action_label
from public.matches m
join public.match_participants mp
  on mp.match_id = m.id
 and mp.status = 'confirmado'
 and mp.is_host = false
join public.profiles p
  on p.id = mp.user_id
where m.created_by = auth.uid()
  and public.match_has_ended(m.id)
  and not exists (
    select 1
    from public.ratings r
    where r.match_id = m.id
      and r.reviewer_id = auth.uid()
      and r.reviewed_id = p.id
      and r.target_role = 'player'
  )

union all

select
  concat('player:', m.id::text, ':', m.created_by::text) as task_id,
  m.id as match_id,
  m.title as match_title,
  m.match_date,
  h.id as target_user_id,
  h.full_name as target_user_name,
  'creator'::public.rating_target_role as target_role,
  'Avaliar host'::text as action_label
from public.matches m
join public.profiles h
  on h.id = m.created_by
where public.match_has_ended(m.id)
  and m.created_by <> auth.uid()
  and exists (
    select 1
    from public.match_participants mp
    where mp.match_id = m.id
      and mp.user_id = auth.uid()
      and mp.status = 'confirmado'
  )
  and not exists (
    select 1
    from public.ratings r
    where r.match_id = m.id
      and r.reviewer_id = auth.uid()
      and r.reviewed_id = m.created_by
      and r.target_role = 'creator'
  );

grant select on public.match_rating_tasks to authenticated;

create or replace function public.sync_rating_notifications_for_current_user()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer := 0;
begin
  insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read, read_at, created_at)
  select
    auth.uid(),
    null,
    'match_rating_available'::public.notification_type,
    'Avaliacao disponivel',
    t.action_label || ' em ' || t.match_title || '.',
    jsonb_build_object(
      'match_id', t.match_id,
      'target_role', t.target_role,
      'target_user_id', t.target_user_id,
      'target_user_name', t.target_user_name
    ),
    false,
    null,
    now()
  from public.match_rating_tasks t
  where not exists (
    select 1
    from public.notifications n
    where n.user_id = auth.uid()
      and n.type = 'match_rating_available'
      and n.metadata->>'match_id' = t.match_id::text
      and n.metadata->>'target_role' = t.target_role::text
      and n.metadata->>'target_user_id' = t.target_user_id::text
  );

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

grant execute on function public.sync_rating_notifications_for_current_user() to authenticated;

-- Backfill notifications for existing user activity to enrich notifications center.
with req as (
  select r.id, r.match_id, r.user_id, r.status, m.created_by as host_id, m.title as match_title
  from public.match_participation_requests r
  join public.matches m on m.id = r.match_id
)
insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read, read_at, created_at)
select
  req.user_id,
  req.host_id,
  case
    when req.status = 'accepted' then 'participation_accepted'::public.notification_type
    when req.status = 'rejected' then 'participation_rejected'::public.notification_type
    else 'participation_pending'::public.notification_type
  end,
  case
    when req.status = 'accepted' then 'Solicitacao aprovada'
    when req.status = 'rejected' then 'Solicitacao recusada'
    else 'Solicitacao enviada'
  end,
  case
    when req.status = 'accepted' then 'Sua solicitacao para ' || coalesce(req.match_title, 'a partida') || ' foi aprovada.'
    when req.status = 'rejected' then 'Sua solicitacao para ' || coalesce(req.match_title, 'a partida') || ' foi recusada.'
    else 'Sua solicitacao para ' || coalesce(req.match_title, 'a partida') || ' esta pendente de aprovacao.'
  end,
  jsonb_build_object('request_id', req.id, 'match_id', req.match_id, 'status', req.status),
  true,
  now(),
  now() - interval '2 days'
from req
where not exists (
  select 1
  from public.notifications n
  where n.user_id = req.user_id
    and n.type in ('participation_pending','participation_accepted','participation_rejected')
    and n.metadata->>'request_id' = req.id::text
);

with req as (
  select r.id, r.match_id, r.user_id, m.created_by as host_id, m.title as match_title, p.full_name as requester_name
  from public.match_participation_requests r
  join public.matches m on m.id = r.match_id
  left join public.profiles p on p.id = r.user_id
)
insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read, read_at, created_at)
select
  req.host_id,
  req.user_id,
  'participation_requested'::public.notification_type,
  'Nova solicitacao de participacao',
  coalesce(req.requester_name, 'Atleta') || ' solicitou participar de ' || coalesce(req.match_title, 'uma partida') || '.',
  jsonb_build_object('request_id', req.id, 'match_id', req.match_id, 'user_id', req.user_id),
  true,
  now(),
  now() - interval '2 days'
from req
where req.host_id is not null
  and req.host_id <> req.user_id
  and not exists (
    select 1
    from public.notifications n
    where n.user_id = req.host_id
      and n.type = 'participation_requested'
      and n.metadata->>'request_id' = req.id::text
  );

insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read, read_at, created_at)
select
  m.created_by as user_id,
  p.id as actor_id,
  'match_rating_available'::public.notification_type,
  'Avaliacao disponivel',
  'Avaliar jogador em ' || coalesce(m.title, 'partida') || '.',
  jsonb_build_object(
    'match_id', m.id,
    'target_role', 'player',
    'target_user_id', p.id,
    'target_user_name', p.full_name
  ),
  false,
  null,
  now() - interval '1 day'
from public.matches m
join public.match_participants mp
  on mp.match_id = m.id
 and mp.status = 'confirmado'
 and mp.is_host = false
join public.profiles p
  on p.id = mp.user_id
where public.match_has_ended(m.id)
  and not exists (
    select 1
    from public.ratings r
    where r.match_id = m.id
      and r.reviewer_id = m.created_by
      and r.reviewed_id = p.id
      and r.target_role = 'player'
  )
  and not exists (
    select 1
    from public.notifications n
    where n.user_id = m.created_by
      and n.type = 'match_rating_available'
      and n.metadata->>'match_id' = m.id::text
      and n.metadata->>'target_role' = 'player'
      and n.metadata->>'target_user_id' = p.id::text
  );

insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read, read_at, created_at)
select
  mp.user_id,
  m.created_by as actor_id,
  'match_rating_available'::public.notification_type,
  'Avaliacao disponivel',
  'Avaliar host em ' || coalesce(m.title, 'partida') || '.',
  jsonb_build_object(
    'match_id', m.id,
    'target_role', 'creator',
    'target_user_id', m.created_by
  ),
  false,
  null,
  now() - interval '1 day'
from public.matches m
join public.match_participants mp
  on mp.match_id = m.id
 and mp.status = 'confirmado'
 and mp.is_host = false
where public.match_has_ended(m.id)
  and not exists (
    select 1
    from public.ratings r
    where r.match_id = m.id
      and r.reviewer_id = mp.user_id
      and r.reviewed_id = m.created_by
      and r.target_role = 'creator'
  )
  and not exists (
    select 1
    from public.notifications n
    where n.user_id = mp.user_id
      and n.type = 'match_rating_available'
      and n.metadata->>'match_id' = m.id::text
      and n.metadata->>'target_role' = 'creator'
      and n.metadata->>'target_user_id' = m.created_by::text
  );
