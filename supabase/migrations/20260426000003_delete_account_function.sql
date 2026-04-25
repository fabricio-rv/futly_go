create or replace function delete_my_account()
returns void
language plpgsql
security definer
as $$
begin
  -- delete auth user (this also cascades to profiles and related data)
  delete from auth.users where id = auth.uid();
end;
$$;

-- grant execute to authenticated users
grant execute on function delete_my_account() to authenticated;
