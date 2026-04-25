-- Fix chat RLS recursion on conversation_participants.

create or replace function public.is_conversation_participant(
  p_conversation_id uuid,
  p_user_id uuid default auth.uid()
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

-- Recreate policies using helper function to avoid self-recursive policy evaluation.
drop policy if exists "Participants can read conversations" on public.conversations;
drop policy if exists "Participants can update conversations" on public.conversations;
drop policy if exists "Participants can read participant rows" on public.conversation_participants;
drop policy if exists "Users can update own participant row" on public.conversation_participants;
drop policy if exists "Participants can read messages" on public.messages;
drop policy if exists "Participants can send user messages" on public.messages;

create policy "Participants can read conversations"
on public.conversations
for select
to authenticated
using (public.is_conversation_participant(id, auth.uid()));

create policy "Participants can update conversations"
on public.conversations
for update
to authenticated
using (public.is_conversation_participant(id, auth.uid()))
with check (public.is_conversation_participant(id, auth.uid()));

create policy "Participants can read participant rows"
on public.conversation_participants
for select
to authenticated
using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "Users can update own participant row"
on public.conversation_participants
for update
to authenticated
using (
  user_id = auth.uid()
  and public.is_conversation_participant(conversation_id, auth.uid())
)
with check (
  user_id = auth.uid()
  and public.is_conversation_participant(conversation_id, auth.uid())
);

create policy "Participants can read messages"
on public.messages
for select
to authenticated
using (public.is_conversation_participant(conversation_id, auth.uid()));

create policy "Participants can send user messages"
on public.messages
for insert
to authenticated
with check (
  message_type = 'user'
  and sender_id = auth.uid()
  and public.is_conversation_participant(conversation_id, auth.uid())
);
