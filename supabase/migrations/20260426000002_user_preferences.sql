alter table profiles
  add column if not exists notifications_enabled boolean not null default true,
  add column if not exists location_enabled boolean not null default true,
  add column if not exists theme text not null default 'dark' check (theme in ('light', 'dark'));
