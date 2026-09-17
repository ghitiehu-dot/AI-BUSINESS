create table if not exists public.learning_progress (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_key text not null, status text not null default 'not_started' check(status in ('not_started','in_progress','completed')), score integer check(score between 0 and 100), updated_at timestamptz not null default now(), unique(user_id,item_key));
create table if not exists public.portfolio_items (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text not null default '', skills text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.learning_progress enable row level security;
alter table public.portfolio_items enable row level security;
drop policy if exists "learning own" on public.learning_progress;
create policy "learning own" on public.learning_progress for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "portfolio own" on public.portfolio_items;
create policy "portfolio own" on public.portfolio_items for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create index if not exists learning_progress_user_idx on public.learning_progress(user_id,updated_at desc);
create index if not exists portfolio_items_user_idx on public.portfolio_items(user_id,created_at desc);
grant select,insert,update,delete on public.learning_progress to authenticated;
grant select,insert,update,delete on public.portfolio_items to authenticated;

create or replace function public.admin_operational_summary() returns jsonb language plpgsql security definer set search_path=public as $$ declare v_role text; v_users integer; v_business integer; v_va integer; v_team integer; v_events integer; begin select role into v_role from public.profiles where id=auth.uid(); if v_role<>'admin' then raise exception 'Forbidden'; end if; select count(*) into v_users from public.profiles; select count(*) filter(where account_type='business') into v_business from public.profiles; select count(*) filter(where account_type='va') into v_va from public.profiles; select count(*) filter(where account_type='team') into v_team from public.profiles; select count(*) into v_events from public.usage_events where created_at>=now()-interval '30 days'; return jsonb_build_object('users',v_users,'business_accounts',v_business,'va_accounts',v_va,'team_accounts',v_team,'usage_events_30d',v_events); end; $$;
revoke all on function public.admin_operational_summary() from public;
grant execute on function public.admin_operational_summary() to authenticated;