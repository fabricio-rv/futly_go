-- Chat mobile push/in-app notification support.
-- Non-destructive: stores Expo tokens and emits per-recipient chat notification rows/outbox items.

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text null,
  device_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, expo_push_token)
);

create index if not exists push_tokens_profile_idx
  on public.push_tokens(profile_id);

alter table public.push_tokens enable row level security;

drop policy if exists "Push token owner can read" on public.push_tokens;
drop policy if exists "Push token owner can insert" on public.push_tokens;
drop policy if exists "Push token owner can update" on public.push_tokens;
drop policy if exists "Push token owner can delete" on public.push_tokens;

create policy "Push token owner can read"
on public.push_tokens
for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "Push token owner can insert"
on public.push_tokens
for insert
to authenticated
with check (profile_id = public.current_profile_id());

create policy "Push token owner can update"
on public.push_tokens
for update
to authenticated
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "Push token owner can delete"
on public.push_tokens
for delete
to authenticated
using (profile_id = public.current_profile_id());

create table if not exists public.chat_push_outbox (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid null references public.notifications(id) on delete cascade,
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  sent_at timestamptz null,
  error text null,
  created_at timestamptz not null default now()
);

create index if not exists chat_push_outbox_pending_idx
  on public.chat_push_outbox(created_at)
  where sent_at is null;

alter table public.chat_push_outbox enable row level security;

drop policy if exists "Outbox is service-role only" on public.chat_push_outbox;
create policy "Outbox is service-role only"
on public.chat_push_outbox
for all
to service_role
using (true)
with check (true);

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
begin
  if new.message_type <> 'user' or new.sender_id is null then
    return new;
  end if;

  select coalesce(nullif(trim(full_name), ''), 'Atleta')
    into sender_name
  from public.profiles
  where id = new.sender_id;

  notification_title := coalesce(sender_name, 'Atleta');
  notification_body := 'Nova mensagem';
  payload := jsonb_build_object(
    'kind', 'chat_message',
    'conversationId', new.conversation_id,
    'conversation_id', new.conversation_id,
    'messageId', new.id,
    'message_id', new.id,
    'route', '/conversations/' || new.conversation_id::text
  );

  for recipient in
    select cp.user_id
    from public.conversation_participants cp
    where cp.conversation_id = new.conversation_id
      and cp.user_id <> new.sender_id
  loop
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

drop trigger if exists enqueue_chat_message_notification_trigger on public.messages;
create trigger enqueue_chat_message_notification_trigger
after insert on public.messages
for each row
execute function public.enqueue_chat_message_notification();
