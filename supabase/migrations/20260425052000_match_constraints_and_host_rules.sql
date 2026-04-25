-- Prevent duplicate match creation and block host from joining own match as regular participant.

with ranked_matches as (
  select
    id,
    row_number() over (
      partition by created_by, title, match_date, match_time, coalesce(venue_name, '')
      order by created_at asc, id asc
    ) as row_rank
  from public.matches
  where status in ('rascunho', 'publicada')
)
update public.matches as m
set
  status = 'cancelada',
  updated_at = now()
from ranked_matches as r
where m.id = r.id
  and r.row_rank > 1;

create unique index if not exists matches_unique_creator_schedule_idx
  on public.matches (created_by, title, match_date, match_time, coalesce(venue_name, ''))
  where status in ('rascunho', 'publicada');

drop policy if exists "Users can join matches as themselves" on public.match_participants;

create policy "Users can join matches as themselves"
on public.match_participants
for insert
to authenticated
with check (
  (
    user_id = auth.uid()
    and is_host = false
    and exists (
      select 1
      from public.matches m
      where m.id = match_participants.match_id
        and m.status = 'publicada'
        and m.allow_external_reserves = true
        and m.created_by <> auth.uid()
    )
  )
  or (
    user_id = auth.uid()
    and is_host = true
    and exists (
      select 1
      from public.matches m
      where m.id = match_participants.match_id
        and m.created_by = auth.uid()
    )
  )
);
