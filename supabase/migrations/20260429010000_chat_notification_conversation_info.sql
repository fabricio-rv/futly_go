-- Atualiza o trigger de notificação de chat para incluir
-- o tipo da conversa (group/private) e o nome do grupo (match_title) no metadata.

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
begin
  if new.message_type <> 'user' or new.sender_id is null then
    return new;
  end if;

  select coalesce(nullif(trim(full_name), ''), 'Atleta')
    into sender_name
  from public.profiles
  where id = new.sender_id;

  -- Busca tipo e nome da conversa
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
