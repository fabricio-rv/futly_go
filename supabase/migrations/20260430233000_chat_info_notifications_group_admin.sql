create table if not exists public.chat_conversation_notification_settings (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

alter table public.chat_conversation_notification_settings enable row level security;

drop policy if exists "Users can read own chat notification settings" on public.chat_conversation_notification_settings;
drop policy if exists "Users can upsert own chat notification settings" on public.chat_conversation_notification_settings;

create policy "Users can read own chat notification settings"
on public.chat_conversation_notification_settings
for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "Users can upsert own chat notification settings"
on public.chat_conversation_notification_settings
for all
to authenticated
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create or replace function public.get_groups_in_common_with_profile(
  p_other_profile_id uuid,
  p_me uuid default public.current_profile_id()
)
returns table (
  conversation_id uuid,
  group_name text,
  members_count integer
)
language sql
security definer
set search_path = public
as $$
  select
    c.id as conversation_id,
    coalesce(c.group_name, m.title, 'Grupo') as group_name,
    (
      select count(*)::int
      from public.conversation_participants cp3
      where cp3.conversation_id = c.id
    ) as members_count
  from public.conversations c
  left join public.matches m on m.id = c.match_id
  join public.conversation_participants cp_me
    on cp_me.conversation_id = c.id and cp_me.user_id = p_me
  join public.conversation_participants cp_other
    on cp_other.conversation_id = c.id and cp_other.user_id = p_other_profile_id
  where c.type = 'group'
  order by c.updated_at desc;
$$;

grant execute on function public.get_groups_in_common_with_profile(uuid, uuid) to authenticated;

create or replace function public.update_group_info(
  p_conversation_id uuid,
  p_name text,
  p_description text default null,
  p_avatar_url text default null
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
    raise exception 'Only admins can update group info';
  end if;

  update public.conversations
  set
    group_name = nullif(btrim(coalesce(p_name, '')), ''),
    group_description = nullif(btrim(coalesce(p_description, '')), ''),
    group_avatar_url = nullif(btrim(coalesce(p_avatar_url, '')), ''),
    updated_at = now()
  where id = p_conversation_id
    and type = 'group';
end;
$$;

grant execute on function public.update_group_info(uuid, text, text, text) to authenticated;

create or replace function public.enqueue_chat_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient record;
  sender_name text;
  notification_id uuid;
  notification_title text;
  notification_body text;
  payload jsonb;
  conv_type text;
  conv_name text;
  recipient_notifications_enabled boolean;
begin
  if new.message_type <> 'user' or new.sender_id is null then
    return new;
  end if;

  select coalesce(nullif(trim(full_name), ''), 'Atleta')
    into sender_name
  from public.profiles
  where id = new.sender_id;

  select
    c.type::text,
    coalesce(m.title, c.group_name)
  into conv_type, conv_name
  from public.conversations c
  left join public.matches m on m.id = c.match_id
  where c.id = new.conversation_id;

  notification_title := coalesce(sender_name, 'Atleta');
  notification_body := 'Nova mensagem';
  payload := jsonb_build_object(
    'kind', 'chat_message',
    'conversationId', new.conversation_id,
    'conversation_id', new.conversation_id,
    'messageId', new.id,
    'message_id', new.id,
    'route', '/conversations/' || new.conversation_id::text,
    'conversationType', coalesce(conv_type, 'group'),
    'conversationName', conv_name
  );

  for recipient in
    select cp.user_id
    from public.conversation_participants cp
    where cp.conversation_id = new.conversation_id
      and cp.user_id <> new.sender_id
  loop
    select coalesce(s.notifications_enabled, true)
      into recipient_notifications_enabled
    from public.chat_conversation_notification_settings s
    where s.conversation_id = new.conversation_id
      and s.profile_id = recipient.user_id;

    if coalesce(recipient_notifications_enabled, true) = false then
      continue;
    end if;

    insert into public.notifications (user_id, actor_id, type, title, body, metadata, is_read)
    values (
      recipient.user_id,
      new.sender_id,
      'system'::public.notification_type,
      notification_title,
      notification_body,
      payload,
      false
    )
    returning id into notification_id;

    insert into public.chat_push_outbox (
      notification_id,
      recipient_profile_id,
      conversation_id,
      message_id,
      title,
      body,
      data
    )
    values (
      notification_id,
      recipient.user_id,
      new.conversation_id,
      new.id,
      notification_title,
      notification_body,
      payload
    );
  end loop;

  return new;
end;
$$;
