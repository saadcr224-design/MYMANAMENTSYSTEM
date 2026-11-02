-- Run once in Supabase SQL Editor. No existing tables are modified.
create table public.sl_members(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.sl_members enable row level security;
create policy member_read on public.sl_members for select to authenticated using(user_id=(select auth.uid()));
grant select on public.sl_members to authenticated;
revoke all on public.sl_members from anon;
create table public.sl_workspaces(user_id uuid primary key references public.sl_members(user_id) on delete cascade,version bigint not null default 1,data jsonb not null default '{"records":[],"payments":[]}'::jsonb,updated_at timestamptz not null default now());
alter table public.sl_workspaces enable row level security;
create policy owner_read on public.sl_workspaces for select to authenticated using(user_id=(select auth.uid()));
create policy owner_insert on public.sl_workspaces for insert to authenticated with check(user_id=(select auth.uid()));
create policy owner_update on public.sl_workspaces for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select,insert,update on public.sl_workspaces to authenticated;
revoke all on public.sl_workspaces from anon;
create function public.sl_save_workspace(expected_version bigint,new_data jsonb) returns bigint language plpgsql security invoker set search_path='' as $$
declare next_version bigint;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(new_data->'records') is distinct from 'array' or jsonb_typeof(new_data->'payments') is distinct from 'array' then raise exception 'Invalid ledger'; end if;
 if expected_version=0 then
 insert into public.sl_workspaces(user_id,data) values(auth.uid(),new_data) returning version into next_version;
 else
 update public.sl_workspaces set data=new_data,version=version+1,updated_at=now() where user_id=auth.uid() and version=expected_version returning version into next_version;
 if not found then raise exception 'Version conflict'; end if;
 end if;
 return next_version;
end;$$;
revoke all on function public.sl_save_workspace(bigint,jsonb) from public,anon;
grant execute on function public.sl_save_workspace(bigint,jsonb) to authenticated;
