create extension if not exists "pgcrypto";

-- Enums for participation requests and notifications.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'participation_request_status') then
    create type public.participation_request_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'participation_requested',
      'participation_pending',
      'participation_accepted',
      'participation_rejected',
      'match_rating_available',
      'rating_received',
      'system'
    );
  end if;
end;
$$;

create table if not exists public.match_participation_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_position_key text not null,
  requested_position_label text not null,
  note text,
  status public.participation_request_status not null default 'pending',
  decision_by uuid references public.profiles(id) on delete set null,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create index if not exists match_participation_requests_match_status_idx
  on public.match_participation_requests(match_id, status, created_at desc);

create index if not exists match_participation_requests_user_status_idx
  on public.match_participation_requests(user_id, status, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type public.notification_type not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_read_created_idx
  on public.notifications(user_id, is_read, created_at desc);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

-- Updated_at triggers.
drop trigger if exists match_participation_requests_set_updated_at on public.match_participation_requests;
create trigger match_participation_requests_set_updated_at
before update on public.match_participation_requests
for each row
execute function public.handle_updated_at();

-- Helper functions.
create or replace function public.is_match_host(p_match_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.created_by = p_user_id
  );
$$;

grant execute on function public.is_match_host(uuid, uuid) to authenticated;

create or replace function public.create_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.notifications (user_id, actor_id, type, title, body, metadata)
  values (p_user_id, p_actor_id, p_type, p_title, p_body, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.create_notification(uuid, uuid, public.notification_type, text, text, jsonb) to authenticated;

create or replace function public.handle_participation_request_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.matches%rowtype;
  v_requester_name text;
begin
  select * into v_match
  from public.matches m
  where m.id = new.match_id;

  select p.full_name into v_requester_name
  from public.profiles p
  where p.id = new.user_id;

  perform public.create_notification(
    v_match.created_by,
    new.user_id,
    'participation_requested',
    'Nova solicitacao de participacao',
    coalesce(v_requester_name, 'Atleta') || ' solicitou participar de ' || coalesce(v_match.title, 'uma partida') || '.',
    jsonb_build_object(
      'request_id', new.id,
      'match_id', new.match_id,
      'user_id', new.user_id,
      'status', new.status
    )
  );

  perform public.create_notification(
    new.user_id,
    v_match.created_by,
    'participation_pending',
    'Solicitacao enviada',
    'Sua solicitacao para ' || coalesce(v_match.title, 'a partida') || ' esta pendente de aprovacao.',
    jsonb_build_object(
      'request_id', new.id,
      'match_id', new.match_id,
      'status', new.status
    )
  );

  return new;
end;
$$;

drop trigger if exists match_participation_requests_after_insert_notify on public.match_participation_requests;
create trigger match_participation_requests_after_insert_notify
after insert on public.match_participation_requests
for each row
execute function public.handle_participation_request_created();

create or replace function public.process_match_participation_request(
  p_request_id uuid,
  p_action text,
  p_decision_reason text default null
)
returns public.match_participation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.match_participation_requests%rowtype;
  v_match public.matches%rowtype;
  v_action text;
  v_position_taken boolean;
  v_host_name text;
begin
  v_action := lower(trim(coalesce(p_action, '')));

  if v_action not in ('accept', 'reject') then
    raise exception 'Invalid action. Use accept or reject.';
  end if;

  select * into v_request
  from public.match_participation_requests r
  where r.id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'Participation request not found.';
  end if;

  select * into v_match
  from public.matches m
  where m.id = v_request.match_id;

  if v_match.id is null then
    raise exception 'Match not found.';
  end if;

  if v_match.created_by <> auth.uid() then
    raise exception 'Only host can process participation requests.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending requests can be processed.';
  end if;

  if v_action = 'accept' then
    select exists (
      select 1
      from public.match_participants mp
      where mp.match_id = v_request.match_id
        and mp.position_key = v_request.requested_position_key
        and mp.status = 'confirmado'
        and mp.user_id <> v_request.user_id
    ) into v_position_taken;

    if v_position_taken then
      raise exception 'Selected position is already occupied.';
    end if;

    insert into public.match_participants (match_id, user_id, position_key, position_label, status, is_host)
    values (v_request.match_id, v_request.user_id, v_request.requested_position_key, v_request.requested_position_label, 'confirmado', false)
    on conflict (match_id, user_id)
    do update
      set position_key = excluded.position_key,
          position_label = excluded.position_label,
          status = 'confirmado',
          is_host = false,
          updated_at = now();

    update public.match_participation_requests
    set
      status = 'accepted',
      decision_by = auth.uid(),
      decision_reason = p_decision_reason,
      decided_at = now(),
      updated_at = now()
    where id = p_request_id
    returning * into v_request;

    select p.full_name into v_host_name from public.profiles p where p.id = auth.uid();

    perform public.create_notification(
      v_request.user_id,
      auth.uid(),
      'participation_accepted',
      'Solicitacao aprovada',
      coalesce(v_host_name, 'Host') || ' aprovou sua solicitacao para ' || coalesce(v_match.title, 'a partida') || '.',
      jsonb_build_object(
        'request_id', v_request.id,
        'match_id', v_request.match_id,
        'status', v_request.status
      )
    );

    perform public.sync_match_conversation_participants(v_request.match_id);
  else
    update public.match_participation_requests
    set
      status = 'rejected',
      decision_by = auth.uid(),
      decision_reason = p_decision_reason,
      decided_at = now(),
      updated_at = now()
    where id = p_request_id
    returning * into v_request;

    select p.full_name into v_host_name from public.profiles p where p.id = auth.uid();

    perform public.create_notification(
      v_request.user_id,
      auth.uid(),
      'participation_rejected',
      'Solicitacao recusada',
      coalesce(v_host_name, 'Host') || ' recusou sua solicitacao para ' || coalesce(v_match.title, 'a partida') || '.',
      jsonb_build_object(
        'request_id', v_request.id,
        'match_id', v_request.match_id,
        'status', v_request.status,
        'reason', p_decision_reason
      )
    );
  end if;

  return v_request;
end;
$$;

grant execute on function public.process_match_participation_request(uuid, text, text) to authenticated;

-- Rating guardrails.
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

  if v_match.status <> 'finalizada' then
    raise exception 'Ratings are available only after match is finalizada.';
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

drop trigger if exists ratings_before_insert_validate on public.ratings;
create trigger ratings_before_insert_validate
before insert on public.ratings
for each row
execute function public.validate_rating_insert();

create or replace function public.handle_rating_created_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_name text;
  v_match_title text;
begin
  select p.full_name into v_reviewer_name from public.profiles p where p.id = new.reviewer_id;
  select m.title into v_match_title from public.matches m where m.id = new.match_id;

  perform public.create_notification(
    new.reviewed_id,
    new.reviewer_id,
    'rating_received',
    'Nova avaliacao recebida',
    coalesce(v_reviewer_name, 'Atleta') || ' avaliou voce em ' || coalesce(v_match_title, 'uma partida') || '.',
    jsonb_build_object(
      'rating_id', new.id,
      'match_id', new.match_id,
      'score', new.score,
      'target_role', new.target_role
    )
  );

  return new;
end;
$$;

drop trigger if exists ratings_after_insert_notify on public.ratings;
create trigger ratings_after_insert_notify
after insert on public.ratings
for each row
execute function public.handle_rating_created_notify();

create or replace function public.notify_match_rating_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player record;
begin
  if old.status = new.status or new.status <> 'finalizada' then
    return new;
  end if;

  perform public.create_notification(
    new.created_by,
    null,
    'match_rating_available',
    'Avaliacoes liberadas',
    'A partida ' || coalesce(new.title, '') || ' foi finalizada. Avalie os jogadores.',
    jsonb_build_object('match_id', new.id, 'target_role', 'player')
  );

  for v_player in
    select mp.user_id
    from public.match_participants mp
    where mp.match_id = new.id
      and mp.status = 'confirmado'
      and mp.user_id <> new.created_by
  loop
    perform public.create_notification(
      v_player.user_id,
      new.created_by,
      'match_rating_available',
      'Avalie o host da partida',
      'A partida ' || coalesce(new.title, '') || ' foi finalizada. Sua avaliacao ja esta disponivel.',
      jsonb_build_object('match_id', new.id, 'target_role', 'creator')
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists matches_after_update_rating_notify on public.matches;
create trigger matches_after_update_rating_notify
after update of status on public.matches
for each row
execute function public.notify_match_rating_availability();

-- Views for agenda and rating tasks.
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
  and m.status = 'finalizada'
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
where m.status = 'finalizada'
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

alter table public.match_participation_requests enable row level security;
alter table public.notifications enable row level security;

-- Block direct player self-booking; host approval flow is mandatory.
drop policy if exists "Users can join matches as themselves" on public.match_participants;

create policy "Only hosts can insert participants directly"
on public.match_participants
for insert
to authenticated
with check (
  exists (
    select 1
    from public.matches m
    where m.id = match_participants.match_id
      and m.created_by = auth.uid()
  )
);

-- RLS for requests.
drop policy if exists "Users can read own or hosted requests" on public.match_participation_requests;
drop policy if exists "Users can create own participation requests" on public.match_participation_requests;
drop policy if exists "Host can update participation requests" on public.match_participation_requests;
drop policy if exists "Requester can cancel own pending request" on public.match_participation_requests;

create policy "Users can read own or hosted requests"
on public.match_participation_requests
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_match_host(match_id, auth.uid())
);

create policy "Users can create own participation requests"
on public.match_participation_requests
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    where m.id = match_participation_requests.match_id
      and m.status = 'publicada'
      and m.created_by <> auth.uid()
  )
);

create policy "Host can update participation requests"
on public.match_participation_requests
for update
to authenticated
using (public.is_match_host(match_id, auth.uid()))
with check (public.is_match_host(match_id, auth.uid()));

create policy "Requester can cancel own pending request"
on public.match_participation_requests
for update
to authenticated
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid());

-- RLS for notifications.
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can mark own notifications" on public.notifications;

create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can mark own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Realtime for notifications.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
