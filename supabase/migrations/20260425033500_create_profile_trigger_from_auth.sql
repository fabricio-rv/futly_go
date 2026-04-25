create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, state, city, cep)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Atleta Futly'),
    lower(new.email),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'state', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    nullif(new.raw_user_meta_data ->> 'cep', '')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    state = excluded.state,
    city = excluded.city,
    cep = excluded.cep,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.profiles (id, full_name, email, phone, state, city, cep)
select
	u.id,
	coalesce(u.raw_user_meta_data ->> 'full_name', 'Atleta Futly'),
	lower(u.email),
	nullif(u.raw_user_meta_data ->> 'phone', ''),
	nullif(u.raw_user_meta_data ->> 'state', ''),
	nullif(u.raw_user_meta_data ->> 'city', ''),
	nullif(u.raw_user_meta_data ->> 'cep', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
