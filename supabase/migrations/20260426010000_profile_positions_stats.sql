-- Remove athlete physical/profile position fields and expose gameplay position stats.

alter table public.profiles
  drop constraint if exists profiles_height_cm_check,
  drop constraint if exists profiles_weight_kg_check;

alter table public.profiles
  drop column if exists height_cm,
  drop column if exists weight_kg,
  drop column if exists primary_position,
  drop column if exists secondary_positions,
  drop column if exists skill_level;

create or replace function public.get_users_position_stats(p_user_ids uuid[])
returns table (
  user_id uuid,
  modality text,
  position_key text,
  position_label text,
  matches_count integer,
  ratings_count integer,
  avg_rating numeric
)
language sql
security definer
set search_path = public
as $$
  select
    mp.user_id,
    m.modality::text as modality,
    mp.position_key,
    mp.position_label,
    count(distinct mp.match_id)::int as matches_count,
    count(r.id)::int as ratings_count,
    round(avg(r.score)::numeric, 2) as avg_rating
  from public.match_participants mp
  join public.matches m
    on m.id = mp.match_id
  left join public.ratings r
    on r.match_id = mp.match_id
   and r.reviewed_id = mp.user_id
  where mp.status = 'confirmado'
    and mp.user_id = any(p_user_ids)
  group by mp.user_id, m.modality, mp.position_key, mp.position_label
  order by mp.user_id, count(distinct mp.match_id) desc, mp.position_label;
$$;

grant execute on function public.get_users_position_stats(uuid[]) to authenticated;
