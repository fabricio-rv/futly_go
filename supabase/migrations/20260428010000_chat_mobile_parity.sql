-- Mobile chat parity primitives over the current conversations/messages schema.

alter table public.profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

update public.profiles
set user_id = u.id
from auth.users u
where profiles.user_id is null
  and profiles.id = u.id;

create unique index if not exists profiles_user_id_unique_idx
  on public.profiles(user_id)
  where user_id is not null;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.user_id = auth.uid()
     or p.id = auth.uid()
  order by case when p.user_id = auth.uid() then 0 else 1 end
  limit 1;
$$;

grant execute on function public.current_profile_id() to authenticated;

create or replace function public.is_conversation_participant(
  p_conversation_id uuid,
  p_user_id uuid default public.current_profile_id()
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = p_user_id
  );
$$;

grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;

drop policy if exists "Participants can read conversations" on public.conversations;
drop policy if exists "Participants can update conversations" on public.conversations;
drop policy if exists "Participants can read participant rows" on public.conversation_participants;
drop policy if exists "Users can update own participant row" on public.conversation_participants;
drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send user messages" on public.messages;
drop policy if exists "Users can join private conversations" on public.conversation_participants;

create policy "Participants can read conversations"
on public.conversations
for select
to authenticated
using (public.is_conversation_participant(id, public.current_profile_id()));

create policy "Participants can update conversations"
on public.conversations
for update
to authenticated
using (public.is_conversation_participant(id, public.current_profile_id()))
with check (public.is_conversation_participant(id, public.current_profile_id()));

create policy "Participants can read participant rows"
on public.conversation_participants
for select
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()));

create policy "Users can join private conversations"
on public.conversation_participants
for insert
to authenticated
with check (
  user_id = public.current_profile_id()
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
using (
  user_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
)
with check (
  user_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
);

create policy "Participants can read messages"
on public.messages
for select
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()));

create policy "Participants can send user messages"
on public.messages
for insert
to authenticated
with check (
  message_type = 'user'
  and sender_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
);

alter table public.conversation_participants
  add column if not exists archived_at timestamptz;

update public.conversation_participants cp
set archived_at = coalesce(cp.archived_at, c.archived_at, now())
from public.conversations c
where c.id = cp.conversation_id
  and c.is_archived = true
  and cp.archived_at is null;

create table if not exists public.chat_message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id),
  constraint message_reactions_emoji_not_blank check (length(btrim(emoji)) > 0)
);

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'message_reactions'
      and constraint_name = 'message_reactions_pkey'
  ) then
    delete from public.message_reactions mr
    using (
      select ctid,
             row_number() over (
               partition by message_id, profile_id
               order by created_at desc, emoji asc
             ) as rn
      from public.message_reactions
    ) ranked
    where mr.ctid = ranked.ctid
      and ranked.rn > 1;

    alter table public.message_reactions
      drop constraint if exists message_reactions_pkey;
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'message_reactions'
      and constraint_name = 'message_reactions_pkey'
  ) then
    alter table public.message_reactions
      add constraint message_reactions_pkey primary key (message_id, profile_id);
  end if;
end;
$$;

create table if not exists public.pinned_messages (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid primary key references public.messages(id) on delete cascade,
  pinned_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_messages (
  message_id uuid not null references public.messages(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create table if not exists public.chat_file_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  storage_bucket text not null default 'chat-attachments',
  storage_path text not null,
  file_name text,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

alter table public.chat_message_receipts
  add column if not exists conversation_id uuid references public.conversations(id) on delete cascade;

alter table public.message_reactions
  add column if not exists conversation_id uuid references public.conversations(id) on delete cascade;

update public.chat_message_receipts r
set conversation_id = m.conversation_id
from public.messages m
where r.message_id = m.id
  and r.conversation_id is null;

update public.message_reactions r
set conversation_id = m.conversation_id
from public.messages m
where r.message_id = m.id
  and r.conversation_id is null;

create or replace function public.set_chat_social_conversation_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.conversation_id is null then
    select m.conversation_id
    into new.conversation_id
    from public.messages m
    where m.id = new.message_id;
  end if;

  return new;
end;
$$;

drop trigger if exists chat_message_receipts_set_conversation_id on public.chat_message_receipts;
create trigger chat_message_receipts_set_conversation_id
before insert or update of message_id, conversation_id on public.chat_message_receipts
for each row
execute function public.set_chat_social_conversation_id();

drop trigger if exists message_reactions_set_conversation_id on public.message_reactions;
create trigger message_reactions_set_conversation_id
before insert or update of message_id, conversation_id on public.message_reactions
for each row
execute function public.set_chat_social_conversation_id();

insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', false)
on conflict (id) do nothing;

create index if not exists chat_message_receipts_profile_idx
  on public.chat_message_receipts(profile_id, message_id);

create index if not exists chat_message_receipts_conversation_idx
  on public.chat_message_receipts(conversation_id, message_id);

create index if not exists message_reactions_message_idx
  on public.message_reactions(message_id);

create index if not exists message_reactions_conversation_idx
  on public.message_reactions(conversation_id, message_id);

create index if not exists pinned_messages_conversation_idx
  on public.pinned_messages(conversation_id, created_at desc);

create index if not exists saved_messages_profile_idx
  on public.saved_messages(profile_id, created_at desc);

create index if not exists chat_file_attachments_message_idx
  on public.chat_file_attachments(message_id);

drop trigger if exists chat_message_receipts_set_updated_at on public.chat_message_receipts;
create trigger chat_message_receipts_set_updated_at
before update on public.chat_message_receipts
for each row
execute function public.handle_updated_at();

alter table public.chat_message_receipts enable row level security;
alter table public.message_reactions enable row level security;
alter table public.pinned_messages enable row level security;
alter table public.saved_messages enable row level security;
alter table public.chat_file_attachments enable row level security;

drop policy if exists "Participants can read message receipts" on public.chat_message_receipts;
drop policy if exists "Participants can upsert own message receipts" on public.chat_message_receipts;
drop policy if exists "Participants can read message reactions" on public.message_reactions;
drop policy if exists "Participants can manage own message reactions" on public.message_reactions;
drop policy if exists "Participants can read pinned messages" on public.pinned_messages;
drop policy if exists "Participants can manage pinned messages" on public.pinned_messages;
drop policy if exists "Users can read own saved messages" on public.saved_messages;
drop policy if exists "Users can manage own saved messages" on public.saved_messages;
drop policy if exists "Participants can read chat attachments" on public.chat_file_attachments;
drop policy if exists "Participants can create chat attachments" on public.chat_file_attachments;

create policy "Participants can read message receipts"
on public.chat_message_receipts
for select
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()));

create policy "Participants can upsert own message receipts"
on public.chat_message_receipts
for all
to authenticated
using (
  profile_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
)
with check (
  profile_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
);

create policy "Participants can read message reactions"
on public.message_reactions
for select
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()));

create policy "Participants can manage own message reactions"
on public.message_reactions
for all
to authenticated
using (profile_id = public.current_profile_id())
with check (
  profile_id = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
);

create policy "Participants can read pinned messages"
on public.pinned_messages
for select
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()));

create policy "Participants can manage pinned messages"
on public.pinned_messages
for all
to authenticated
using (public.is_conversation_participant(conversation_id, public.current_profile_id()))
with check (
  pinned_by = public.current_profile_id()
  and public.is_conversation_participant(conversation_id, public.current_profile_id())
);

create policy "Users can read own saved messages"
on public.saved_messages
for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "Users can manage own saved messages"
on public.saved_messages
for all
to authenticated
using (profile_id = public.current_profile_id())
with check (
  profile_id = public.current_profile_id()
  and exists (
    select 1
    from public.messages m
    where m.id = saved_messages.message_id
      and public.is_conversation_participant(m.conversation_id, public.current_profile_id())
  )
);

create policy "Participants can read chat attachments"
on public.chat_file_attachments
for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    where m.id = chat_file_attachments.message_id
      and public.is_conversation_participant(m.conversation_id, public.current_profile_id())
  )
);

create policy "Participants can create chat attachments"
on public.chat_file_attachments
for insert
to authenticated
with check (
  created_by = public.current_profile_id()
  and exists (
    select 1
    from public.messages m
    where m.id = chat_file_attachments.message_id
      and public.is_conversation_participant(m.conversation_id, public.current_profile_id())
  )
);

create or replace view public.chat_conversation_list
with (security_invoker = true)
as
select
  c.id as conversation_id,
  c.type as conversation_type,
  c.match_id,
  (cp.archived_at is not null) as is_archived,
  cp.archived_at,
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
      and (um.sender_id is null or um.sender_id <> public.current_profile_id())
  ) as unread_count
from public.conversations c
join public.conversation_participants cp
  on cp.conversation_id = c.id
 and cp.user_id = public.current_profile_id()
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
    and cp2.user_id <> public.current_profile_id()
  order by cp2.joined_at asc
  limit 1
) partner on c.type = 'private';

grant select on public.chat_conversation_list to authenticated;

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
  v_me := public.current_profile_id();

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

create or replace function public.add_group_participant(
  p_conversation_id uuid,
  p_profile_id uuid,
  p_role public.conversation_role default 'player'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.current_profile_id();
begin
  if not exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = v_me
      and cp.role = 'host'
  ) then
    raise exception 'Only admins can add participants';
  end if;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values (p_conversation_id, p_profile_id, p_role)
  on conflict (conversation_id, user_id)
  do update set role = excluded.role;
end;
$$;

create or replace function public.remove_group_participant(
  p_conversation_id uuid,
  p_profile_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.current_profile_id();
  v_admin_count integer;
  v_target_role public.conversation_role;
begin
  if not exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = v_me
      and cp.role = 'host'
  ) and v_me <> p_profile_id then
    raise exception 'Only admins can remove participants';
  end if;

  select role into v_target_role
  from public.conversation_participants
  where conversation_id = p_conversation_id
    and user_id = p_profile_id;

  if v_target_role = 'host' then
    select count(*) into v_admin_count
    from public.conversation_participants
    where conversation_id = p_conversation_id
      and role = 'host';

    if v_admin_count <= 1 then
      raise exception 'Cannot remove the last admin';
    end if;
  end if;

  delete from public.conversation_participants
  where conversation_id = p_conversation_id
    and user_id = p_profile_id;
end;
$$;

create or replace function public.update_group_participant_role(
  p_conversation_id uuid,
  p_profile_id uuid,
  p_role public.conversation_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.current_profile_id();
  v_admin_count integer;
  v_current_role public.conversation_role;
begin
  if not exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = v_me
      and cp.role = 'host'
  ) then
    raise exception 'Only admins can update roles';
  end if;

  select role into v_current_role
  from public.conversation_participants
  where conversation_id = p_conversation_id
    and user_id = p_profile_id;

  if v_current_role = 'host' and p_role <> 'host' then
    select count(*) into v_admin_count
    from public.conversation_participants
    where conversation_id = p_conversation_id
      and role = 'host';

    if v_admin_count <= 1 then
      raise exception 'Cannot demote the last admin';
    end if;
  end if;

  update public.conversation_participants
  set role = p_role
  where conversation_id = p_conversation_id
    and user_id = p_profile_id;
end;
$$;

grant execute on function public.add_group_participant(uuid, uuid, public.conversation_role) to authenticated;
grant execute on function public.remove_group_participant(uuid, uuid) to authenticated;
grant execute on function public.update_group_participant_role(uuid, uuid, public.conversation_role) to authenticated;

drop policy if exists "Chat participants can upload attachments" on storage.objects;
drop policy if exists "Chat participants can read attachments" on storage.objects;

create policy "Chat participants can upload attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and public.is_conversation_participant((storage.foldername(name))[1]::uuid, public.current_profile_id())
);

create policy "Chat participants can read attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and public.is_conversation_participant((storage.foldername(name))[1]::uuid, public.current_profile_id())
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_message_receipts'
  ) then
    alter publication supabase_realtime add table public.chat_message_receipts;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'message_reactions'
  ) then
    alter publication supabase_realtime add table public.message_reactions;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pinned_messages'
  ) then
    alter publication supabase_realtime add table public.pinned_messages;
  end if;
end;
$$;
