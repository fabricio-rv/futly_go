create extension if not exists "pgcrypto";

-- Chat enums.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'conversation_type') then
    create type public.conversation_type as enum ('group', 'private');
  end if;

  if not exists (select 1 from pg_type where typname = 'conversation_role') then
    create type public.conversation_role as enum ('host', 'player', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type public.message_type as enum ('user', 'system');
  end if;
end;
$$;

-- Conversations master table.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null,
  match_id uuid references public.matches(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_archived boolean not null default false,
  archived_at timestamptz,
  last_message_id uuid,
  last_message_at timestamptz,
  constraint conversations_match_by_type_chk check (
    (type = 'group' and match_id is not null)
    or (type = 'private' and match_id is null)
  )
);

create unique index if not exists conversations_group_match_unique_idx
  on public.conversations(match_id)
  where type = 'group';

create index if not exists conversations_is_archived_last_message_idx
  on public.conversations(is_archived, coalesce(last_message_at, created_at) desc);

create index if not exists conversations_created_by_idx on public.conversations(created_by);

-- Participants pivot.
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.conversation_role not null default 'player',
  last_read_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_idx
  on public.conversation_participants(user_id, conversation_id);

create index if not exists conversation_participants_role_idx
  on public.conversation_participants(user_id, role, conversation_id);

-- Messages table.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  message_type public.message_type not null default 'user',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint messages_content_not_blank_chk check (length(btrim(content)) > 0),
  constraint messages_sender_by_type_chk check (
    (message_type = 'system' and sender_id is null)
    or (message_type = 'user' and sender_id is not null)
  )
);

create index if not exists messages_conversation_created_at_idx
  on public.messages(conversation_id, created_at desc);

create index if not exists messages_conversation_created_at_unread_idx
  on public.messages(conversation_id, created_at)
  include (sender_id);

-- Add FK now that messages exists.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_last_message_id_fkey'
  ) then
    alter table public.conversations
      add constraint conversations_last_message_id_fkey
      foreign key (last_message_id)
      references public.messages(id)
      on delete set null;
  end if;
end;
$$;

-- Updated_at trigger (shared function already exists in project).
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row
execute function public.handle_updated_at();

-- Keep conversations denormalized with latest message for fast list queries.
create or replace function public.handle_new_message_update_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_id = new.id,
    last_message_at = new.created_at,
    updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists messages_after_insert_update_conversation on public.messages;
create trigger messages_after_insert_update_conversation
after insert on public.messages
for each row
execute function public.handle_new_message_update_conversation();

-- Helper to ensure a group conversation exists for each match.
create or replace function public.ensure_match_conversation(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
  v_host_id uuid;
begin
  select id, created_by
  into v_conversation_id, v_host_id
  from public.matches
  where id = p_match_id;

  if v_conversation_id is null then
    raise exception 'Match % not found', p_match_id;
  end if;

  insert into public.conversations (type, match_id, created_by)
  values ('group', p_match_id, v_host_id)
  on conflict (match_id)
  where type = 'group'
  do update set updated_at = now()
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values (v_conversation_id, v_host_id, 'host')
  on conflict (conversation_id, user_id)
  do update set role = 'host';

  return v_conversation_id;
end;
$$;

-- Synchronize group chat participants with match participants.
create or replace function public.sync_match_conversation_participants(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  v_conversation_id := public.ensure_match_conversation(p_match_id);

  with desired as (
    select m.created_by as user_id, 'host'::public.conversation_role as role
    from public.matches m
    where m.id = p_match_id

    union

    select mp.user_id,
           case when mp.is_host then 'host'::public.conversation_role else 'player'::public.conversation_role end
    from public.match_participants mp
    where mp.match_id = p_match_id
      and mp.status = 'confirmado'
  )
  insert into public.conversation_participants (conversation_id, user_id, role)
  select v_conversation_id, d.user_id, d.role
  from desired d
  on conflict (conversation_id, user_id)
  do update set role = excluded.role;

  delete from public.conversation_participants cp
  where cp.conversation_id = v_conversation_id
    and not exists (
      select 1
      from (
        select m.created_by as user_id
        from public.matches m
        where m.id = p_match_id

        union

        select mp.user_id
        from public.match_participants mp
        where mp.match_id = p_match_id
          and mp.status = 'confirmado'
      ) d
      where d.user_id = cp.user_id
    );
end;
$$;

create or replace function public.handle_match_chat_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_match_conversation_participants(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

create or replace function public.handle_match_participant_chat_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_match_conversation_participants(coalesce(new.match_id, old.match_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists matches_chat_sync_trigger on public.matches;
create trigger matches_chat_sync_trigger
after insert or update of created_by on public.matches
for each row
execute function public.handle_match_chat_sync();

drop trigger if exists match_participants_chat_sync_trigger on public.match_participants;
create trigger match_participants_chat_sync_trigger
after insert or update or delete on public.match_participants
for each row
execute function public.handle_match_participant_chat_sync();

-- Seed/sync existing matches to guarantee one conversation per match.
do $$
declare
  v_match_id uuid;
begin
  for v_match_id in
    select id from public.matches
  loop
    perform public.sync_match_conversation_participants(v_match_id);
  end loop;
end;
$$;

-- Private conversation helper.
create or replace function public.create_private_conversation(p_other_user_id uuid, p_initial_message text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_conversation_id uuid;
begin
  v_me := auth.uid();

  if v_me is null then
    raise exception 'Not authenticated';
  end if;

  if p_other_user_id is null or p_other_user_id = v_me then
    raise exception 'Invalid target user';
  end if;

  select c.id
  into v_conversation_id
  from public.conversations c
  join public.conversation_participants me_participant
    on me_participant.conversation_id = c.id
   and me_participant.user_id = v_me
  join public.conversation_participants other_participant
    on other_participant.conversation_id = c.id
   and other_participant.user_id = p_other_user_id
  where c.type = 'private'
    and not exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = c.id
        and cp.user_id not in (v_me, p_other_user_id)
    )
  order by c.created_at desc
  limit 1;

  if v_conversation_id is null then
    insert into public.conversations (type, created_by)
    values ('private', v_me)
    returning id into v_conversation_id;

    insert into public.conversation_participants (conversation_id, user_id, role)
    values
      (v_conversation_id, v_me, 'player'),
      (v_conversation_id, p_other_user_id, 'player')
    on conflict (conversation_id, user_id) do nothing;
  end if;

  if p_initial_message is not null and length(btrim(p_initial_message)) > 0 then
    insert into public.messages (conversation_id, sender_id, content, message_type)
    values (v_conversation_id, v_me, p_initial_message, 'user');
  end if;

  return v_conversation_id;
end;
$$;

grant execute on function public.create_private_conversation(uuid, text) to authenticated;
grant execute on function public.ensure_match_conversation(uuid) to authenticated;

-- Auto archive: 7 days after scheduled match datetime.
create or replace function public.archive_expired_match_conversations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  update public.conversations c
  set
    is_archived = true,
    archived_at = coalesce(c.archived_at, now()),
    updated_at = now()
  from public.matches m
  where c.match_id = m.id
    and c.type = 'group'
    and c.is_archived = false
    and ((m.match_date::timestamp + m.match_time) + interval '7 days') <= now();

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

-- Try to schedule daily archival with pg_cron (if available in this project).
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception
    when others then
      raise notice 'pg_cron extension not available in this environment: %', sqlerrm;
      return;
  end;

  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'archive_conversations_daily';

    perform cron.schedule(
      'archive_conversations_daily',
      '15 3 * * *',
      $job$select public.archive_expired_match_conversations();$job$
    );
  end if;
end;
$$;

-- Run once during migration to align current data.
select public.archive_expired_match_conversations();

-- RLS.
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Conversations policies.
drop policy if exists "Participants can read conversations" on public.conversations;
drop policy if exists "Authenticated can create private conversations" on public.conversations;
drop policy if exists "Participants can update conversations" on public.conversations;

create policy "Participants can read conversations"
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

create policy "Authenticated can create private conversations"
on public.conversations
for insert
to authenticated
with check (
  type = 'private'
  and created_by = auth.uid()
  and match_id is null
);

create policy "Participants can update conversations"
on public.conversations
for update
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

-- Conversation participants policies.
drop policy if exists "Participants can read participant rows" on public.conversation_participants;
drop policy if exists "Users can join private conversations" on public.conversation_participants;
drop policy if exists "Users can update own participant row" on public.conversation_participants;

create policy "Participants can read participant rows"
on public.conversation_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can join private conversations"
on public.conversation_participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.type = 'private'
  )
);

create policy "Users can update own participant row"
on public.conversation_participants
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Messages policies.
drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send user messages" on public.messages;

create policy "Participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

create policy "Participants can send user messages"
on public.messages
for insert
to authenticated
with check (
  message_type = 'user'
  and sender_id = auth.uid()
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

-- Realtime publications.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversation_participants'
  ) then
    alter publication supabase_realtime add table public.conversation_participants;
  end if;
end;
$$;

-- View for chat list optimized for app filters.
create or replace view public.chat_conversation_list
with (security_invoker = true)
as
select
  c.id as conversation_id,
  c.type as conversation_type,
  c.match_id,
  c.is_archived,
  c.archived_at,
  c.created_at,
  c.last_message_at,
  cp.role as my_role,
  m.created_by as match_host_id,
  m.title as match_title,
  m.venue_name as match_venue_name,
  m.match_date,
  m.match_time,
  lm.id as last_message_id,
  lm.content as last_message_content,
  lm.created_at as last_message_created_at,
  lm.message_type as last_message_type,
  lm.sender_id as last_message_sender_id,
  coalesce(lp.full_name, 'Sistema') as last_message_sender_name,
  partner.user_id as private_partner_id,
  partner.full_name as private_partner_name,
  (
    select count(*)::int
    from public.messages um
    where um.conversation_id = c.id
      and um.created_at > coalesce(cp.last_read_at, 'epoch'::timestamptz)
      and (um.sender_id is null or um.sender_id <> auth.uid())
  ) as unread_count
from public.conversations c
join public.conversation_participants cp
  on cp.conversation_id = c.id
 and cp.user_id = auth.uid()
left join public.matches m
  on m.id = c.match_id
left join public.messages lm
  on lm.id = c.last_message_id
left join public.profiles lp
  on lp.id = lm.sender_id
left join lateral (
  select cp2.user_id, p2.full_name
  from public.conversation_participants cp2
  join public.profiles p2
    on p2.id = cp2.user_id
  where cp2.conversation_id = c.id
    and cp2.user_id <> auth.uid()
  order by cp2.joined_at asc
  limit 1
) partner on c.type = 'private';

grant select on public.chat_conversation_list to authenticated;
