create table support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

alter table support_messages enable row level security;

create policy "users insert own" on support_messages
  for insert
  with check (auth.uid() = user_id);

create policy "users read own" on support_messages
  for select
  using (auth.uid() = user_id);
