create extension if not exists "pgcrypto";

-- Courts table for community-created venues.
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,

  -- Optional external/legacy identifier from local datasets (ex: src/data/quadras.ts id).
  legacy_id text,

  name text not null,
  location_preview text not null,
  address text not null,
  phone text not null,
  state text not null,
  city text not null,
  cep text not null,

  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,

  amenities text[] not null default '{}',
  working_hours jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint courts_rating_range_check check (rating >= 0 and rating <= 5),
  constraint courts_review_count_nonnegative_check check (review_count >= 0),
  constraint courts_name_not_blank check (length(trim(name)) > 0),
  constraint courts_address_not_blank check (length(trim(address)) > 0),
  constraint courts_city_not_blank check (length(trim(city)) > 0),
  constraint courts_state_not_blank check (length(trim(state)) > 0),
  constraint courts_cep_not_blank check (length(trim(cep)) > 0)
);

create unique index if not exists courts_legacy_id_unique_idx
  on public.courts(legacy_id)
  where legacy_id is not null;

create index if not exists courts_created_by_idx on public.courts(created_by);
create index if not exists courts_city_state_idx on public.courts(city, state);
create index if not exists courts_name_idx on public.courts(name);
create index if not exists courts_created_at_idx on public.courts(created_at desc);

-- Reuse shared timestamp trigger function if available.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists courts_set_updated_at on public.courts;
create trigger courts_set_updated_at
before update on public.courts
for each row
execute function public.handle_updated_at();

alter table public.courts enable row level security;

drop policy if exists "Authenticated users can read courts" on public.courts;
drop policy if exists "Users can insert own courts" on public.courts;
drop policy if exists "Users can update own courts" on public.courts;
drop policy if exists "Users can delete own courts" on public.courts;

create policy "Authenticated users can read courts"
on public.courts
for select
to authenticated
using (true);

create policy "Users can insert own courts"
on public.courts
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Users can update own courts"
on public.courts
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

create policy "Users can delete own courts"
on public.courts
for delete
to authenticated
using (created_by = auth.uid());
