-- Custom chat groups (non-match) with optional auto-archive behavior.

alter table public.conversations
  add column if not exists group_name text,
  add column if not exists group_description text,
  add column if not exists group_avatar_url text,
  add column if not exists is_custom_group boolean not null default false,
  add column if not exists auto_archive_enabled boolean not null default true;

alter table public.conversations
  drop constraint if exists conversations_match_by_type_chk;

alter table public.conversations
  add constraint conversations_match_by_type_chk check (
    (
      type = 'group'
      and (
        match_id is not null
        or is_custom_group = true
      )
    )
    or (
      type = 'private'
      and match_id is null
      and is_custom_group = false
    )
  );

create index if not exists conversations_custom_group_idx
  on public.conversations(is_custom_group, auto_archive_enabled, coalesce(last_message_at, created_at) desc);

create or replace function public.create_custom_group_conversation(
  p_name text,
  p_description text default null,
  p_avatar_url text default null,
  p_member_ids uuid[] default '{}',
  p_auto_archive_enabled boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := public.current_profile_id();
  v_conversation_id uuid;
begin
  if v_me is null then
    raise exception 'Not authenticated';
  end if;

  if p_name is null or length(btrim(p_name)) = 0 then
    raise exception 'Group name is required';
  end if;

  insert into public.conversations (
    type,
    match_id,
    created_by,
    is_custom_group,
    auto_archive_enabled,
    group_name,
    group_description,
    group_avatar_url
  )
  values (
    'group',
    null,
    v_me,
    true,
    coalesce(p_auto_archive_enabled, false),
    btrim(p_name),
    nullif(btrim(coalesce(p_description, '')), ''),
    nullif(btrim(coalesce(p_avatar_url, '')), '')
  )
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values (v_conversation_id, v_me, 'host')
  on conflict (conversation_id, user_id) do update set role = 'host';

  insert into public.conversation_participants (conversation_id, user_id, role)
  select v_conversation_id, member_id, 'player'::public.conversation_role
  from unnest(coalesce(p_member_ids, '{}'::uuid[])) as member_id
  where member_id is not null
    and member_id <> v_me
  on conflict (conversation_id, user_id) do nothing;

  return v_conversation_id;
end;
$$;

grant execute on function public.create_custom_group_conversation(text, text, text, uuid[], boolean) to authenticated;

create or replace function public.archive_expired_match_conversations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
  v_custom_updated integer;
begin
  update public.conversations c
  set
    is_archived = true,
    archived_at = coalesce(c.archived_at, now()),
    updated_at = now()
  from public.matches m
  where c.match_id = m.id
    and c.type = 'group'
    and c.auto_archive_enabled = true
    and c.is_archived = false
    and ((m.match_date::timestamp + m.match_time) + interval '7 days') <= now();

  get diagnostics v_updated = row_count;

  update public.conversations c
  set
    is_archived = true,
    archived_at = coalesce(c.archived_at, now()),
    updated_at = now()
  where c.type = 'group'
    and c.is_custom_group = true
    and c.auto_archive_enabled = true
    and c.is_archived = false
    and (coalesce(c.last_message_at, c.created_at) + interval '7 days') <= now();

  get diagnostics v_custom_updated = row_count;
  v_updated := v_updated + v_custom_updated;
  return v_updated;
end;
$$;

drop view if exists public.chat_conversation_list;

create view public.chat_conversation_list
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
  c.group_name,
  c.group_description,
  c.group_avatar_url,
  c.is_custom_group,
  c.auto_archive_enabled,
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
