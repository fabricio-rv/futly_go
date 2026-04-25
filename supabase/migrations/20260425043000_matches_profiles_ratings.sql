-- Core schema for matches, participants, ratings and athlete profile fields.
create extension if not exists "pgcrypto";

-- Shared trigger function (idempotent).
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Enums (idempotent via catalog check).
do $$
begin
  if not exists (select 1 from pg_type where typname = 'match_turno') then
    create type public.match_turno as enum ('manha', 'tarde', 'noite');
  end if;

  if not exists (select 1 from pg_type where typname = 'match_level') then
    create type public.match_level as enum (
      'pereba',
      'resenha',
      'casual',
      'intermediario',
      'avancado',
      'competitivo',
      'semi_amador',
      'amador',
      'ex_profissional'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'match_status') then
    create type public.match_status as enum ('rascunho', 'publicada', 'cancelada', 'finalizada');
  end if;

  if not exists (select 1 from pg_type where typname = 'participant_status') then
    create type public.participant_status as enum ('confirmado', 'pendente', 'cancelado');
  end if;

  if not exists (select 1 from pg_type where typname = 'rating_target_role') then
    create type public.rating_target_role as enum ('creator', 'player');
  end if;
end;
$$;

-- Profiles extension (preserves existing auth linkage/table).
alter table public.profiles
  add column if not exists bio text,
  add column if not exists primary_position text,
  add column if not exists secondary_positions text[] not null default '{}',
  add column if not exists skill_level public.match_level,
  add column if not exists height_cm numeric(5,2),
  add column if not exists weight_kg numeric(5,2),
  add column if not exists birth_date date,
  add column if not exists avatar_url text;

alter table public.profiles
  alter column secondary_positions set default '{}';

alter table public.profiles
  drop constraint if exists profiles_height_cm_check,
  drop constraint if exists profiles_weight_kg_check;

alter table public.profiles
  add constraint profiles_height_cm_check check (height_cm is null or (height_cm >= 90 and height_cm <= 260)),
  add constraint profiles_weight_kg_check check (weight_kg is null or (weight_kg >= 25 and weight_kg <= 300));

-- Matches table.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  modality text not null check (modality in ('futsal', 'society', 'campo')),
  match_date date not null,
  match_time time not null,
  turno public.match_turno not null,
  duration_minutes integer not null check (duration_minutes between 30 and 300),
  price_per_person numeric(10,2) not null default 0 check (price_per_person >= 0),
  min_age smallint not null default 16 check (min_age between 10 and 100),
  max_age smallint not null default 80 check (max_age between 10 and 100),
  accepted_levels public.match_level[] not null default '{}',
  status public.match_status not null default 'publicada',
  allow_external_reserves boolean not null default true,
  rest_break boolean not null default false,
  referee_included boolean not null default false,
  contact_phone text,
  venue_name text,
  cep text,
  district text,
  city text,
  state text,
  address text,
  formation_json jsonb not null default '{}'::jsonb,
  facilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_age_range_check check (min_age <= max_age)
);

create index if not exists matches_created_by_idx on public.matches(created_by);
create index if not exists matches_date_time_idx on public.matches(match_date, match_time);
create index if not exists matches_city_state_idx on public.matches(city, state);
create index if not exists matches_status_idx on public.matches(status);
create index if not exists matches_modality_idx on public.matches(modality);

-- Participants pivot.
create table if not exists public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  position_key text not null,
  position_label text not null,
  status public.participant_status not null default 'confirmado',
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create unique index if not exists match_participants_unique_confirmed_position_idx
  on public.match_participants(match_id, position_key)
  where status = 'confirmado';

create index if not exists match_participants_match_idx on public.match_participants(match_id);
create index if not exists match_participants_user_idx on public.match_participants(user_id);

-- Ratings.
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_id uuid not null references public.profiles(id) on delete cascade,
  target_role public.rating_target_role not null,
  score smallint not null check (score between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ratings_no_self_review check (reviewer_id <> reviewed_id),
  unique (match_id, reviewer_id, reviewed_id)
);

create index if not exists ratings_match_idx on public.ratings(match_id);
create index if not exists ratings_reviewer_idx on public.ratings(reviewer_id);
create index if not exists ratings_reviewed_idx on public.ratings(reviewed_id);

-- Timestamp triggers.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at
before update on public.matches
for each row
execute function public.handle_updated_at();

drop trigger if exists match_participants_set_updated_at on public.match_participants;
create trigger match_participants_set_updated_at
before update on public.match_participants
for each row
execute function public.handle_updated_at();

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
before update on public.ratings
for each row
execute function public.handle_updated_at();

-- RLS.
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.ratings enable row level security;

-- Replace restrictive old profile policies with collaborative read + owner write.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can create own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Matches policies.
drop policy if exists "Authenticated users can read published matches" on public.matches;
drop policy if exists "Users can insert own matches" on public.matches;
drop policy if exists "Users can update own matches" on public.matches;
drop policy if exists "Users can delete own matches" on public.matches;

create policy "Authenticated users can read published matches"
on public.matches
for select
to authenticated
using (status <> 'rascunho' or created_by = auth.uid());

create policy "Users can insert own matches"
on public.matches
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Users can update own matches"
on public.matches
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Users can delete own matches"
on public.matches
for delete
to authenticated
using (created_by = auth.uid());

-- Match participants policies.
drop policy if exists "Authenticated users can read match participants" on public.match_participants;
drop policy if exists "Users can join matches as themselves" on public.match_participants;
drop policy if exists "Users can update own participant row" on public.match_participants;
drop policy if exists "Users can remove own participant row" on public.match_participants;
drop policy if exists "Match creators can manage participants" on public.match_participants;

create policy "Authenticated users can read match participants"
on public.match_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_participants.match_id
      and (m.status <> 'rascunho' or m.created_by = auth.uid())
  )
);

create policy "Users can join matches as themselves"
on public.match_participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    where m.id = match_participants.match_id
      and m.status = 'publicada'
  )
);

create policy "Users can update own participant row"
on public.match_participants
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can remove own participant row"
on public.match_participants
for delete
to authenticated
using (user_id = auth.uid());

create policy "Match creators can manage participants"
on public.match_participants
for all
to authenticated
using (
  exists (
    select 1
    from public.matches m
    where m.id = match_participants.match_id
      and m.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.matches m
    where m.id = match_participants.match_id
      and m.created_by = auth.uid()
  )
);

-- Ratings policies.
drop policy if exists "Authenticated users can read related ratings" on public.ratings;
drop policy if exists "Users can insert own ratings" on public.ratings;
drop policy if exists "Users can update own ratings" on public.ratings;
drop policy if exists "Users can delete own ratings" on public.ratings;

create policy "Authenticated users can read related ratings"
on public.ratings
for select
to authenticated
using (
  reviewer_id = auth.uid()
  or reviewed_id = auth.uid()
  or exists (
    select 1
    from public.matches m
    where m.id = ratings.match_id
      and m.created_by = auth.uid()
  )
);

create policy "Users can insert own ratings"
on public.ratings
for insert
to authenticated
with check (reviewer_id = auth.uid());

create policy "Users can update own ratings"
on public.ratings
for update
to authenticated
using (reviewer_id = auth.uid())
with check (reviewer_id = auth.uid());

create policy "Users can delete own ratings"
on public.ratings
for delete
to authenticated
using (reviewer_id = auth.uid());
