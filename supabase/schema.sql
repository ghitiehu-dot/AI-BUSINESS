create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'user' check (role in ('user','admin')), account_type text not null default 'va' check (account_type in ('va','business','team')), created_at timestamptz not null default now());
create table if not exists public.plans (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, monthly_price numeric(12,2) not null default 0, monthly_credits integer not null default 0, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, plan_id uuid not null references public.plans(id), status text not null default 'active' check(status in ('active','trialing','past_due','canceled','expired')), starts_at timestamptz not null default now(), ends_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.usage_events (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, event_type text not null, units integer not null default 1 check(units>0), metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table if not exists public.credit_grants (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, source text not null check(source in ('monthly_plan','promo','manual')), units integer not null check(units>0), valid_from timestamptz not null, valid_until timestamptz not null, metadata jsonb not null default '{}', created_at timestamptz not null default now(), unique(user_id,source,valid_from));
create table if not exists public.promo_codes (id uuid primary key default gen_random_uuid(), code text unique not null, plan_id uuid references public.plans(id), credits integer not null default 0 check(credits>=0), duration_days integer not null default 30 check(duration_days>0), max_redemptions integer, redeemed_count integer not null default 0 check(redeemed_count>=0), starts_at timestamptz not null default now(), expires_at timestamptz, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.promo_redemptions (id uuid primary key default gen_random_uuid(), promo_id uuid not null references public.promo_codes(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, redeemed_at timestamptz not null default now(), unique(promo_id,user_id));
create table if not exists public.business_workspaces (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, name text not null, description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.business_tasks (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, workspace_id uuid references public.business_workspaces(id) on delete cascade, title text not null, description text, status text not null default 'todo' check(status in ('todo','in_progress','review','done')), priority text not null default 'normal' check(priority in ('low','normal','high','urgent')), assigned_to uuid references auth.users(id) on delete set null, due_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.business_team_members (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, workspace_id uuid references public.business_workspaces(id) on delete cascade, member_user_id uuid references auth.users(id) on delete cascade, email text not null, role text not null default 'member' check(role in ('owner','manager','member','va')), status text not null default 'invited' check(status in ('invited','active','removed')), created_at timestamptz not null default now(), unique(workspace_id,email));
create table if not exists public.learning_progress (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, item_key text not null, status text not null default 'not_started' check(status in ('not_started','in_progress','completed')), score integer check(score between 0 and 100), updated_at timestamptz not null default now(), unique(user_id,item_key));
create table if not exists public.portfolio_items (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, description text not null default '', skills text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());

insert into public.plans(slug,name,monthly_price,monthly_credits) values ('free','Free',0,100),('starter','Starter',299,1000),('pro','Pro',699,3000) on conflict(slug) do update set name=excluded.name,monthly_price=excluded.monthly_price,monthly_credits=excluded.monthly_credits;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.credit_grants enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
alter table public.business_workspaces enable row level security;
alter table public.business_tasks enable row level security;
alter table public.business_team_members enable row level security;
alter table public.learning_progress enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "profile own" on public.profiles;
create policy "profile own" on public.profiles for select to authenticated using ((select auth.uid())=id);
drop policy if exists "profile update own" on public.profiles;
create policy "profile update own" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
drop policy if exists "plans public read" on public.plans;
create policy "plans public read" on public.plans for select to anon,authenticated using (active=true);
drop policy if exists "subscription own" on public.subscriptions;
create policy "subscription own" on public.subscriptions for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "usage own" on public.usage_events;
create policy "usage own" on public.usage_events for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "usage insert own" on public.usage_events;
drop policy if exists "credit grants own" on public.credit_grants;
create policy "credit grants own" on public.credit_grants for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "redemption own" on public.promo_redemptions;
create policy "redemption own" on public.promo_redemptions for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "business workspace owner access" on public.business_workspaces;
create policy "business workspace owner access" on public.business_workspaces for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "business task owner access" on public.business_tasks;
create policy "business task owner access" on public.business_tasks for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "business team owner access" on public.business_team_members;
create policy "business team owner access" on public.business_team_members for all to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
drop policy if exists "learning own" on public.learning_progress;
create policy "learning own" on public.learning_progress for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "portfolio own" on public.portfolio_items;
create policy "portfolio own" on public.portfolio_items for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create index if not exists business_tasks_owner_created_idx on public.business_tasks(owner_id,created_at desc);
create index if not exists business_tasks_workspace_idx on public.business_tasks(workspace_id);
create index if not exists business_team_owner_idx on public.business_team_members(owner_id);
create index if not exists credit_grants_user_period_idx on public.credit_grants(user_id,valid_from,valid_until);
create index if not exists learning_progress_user_idx on public.learning_progress(user_id,updated_at desc);
create index if not exists portfolio_items_user_idx on public.portfolio_items(user_id,created_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name') on conflict(id) do nothing; return new; end; $$;
revoke all on function public.handle_new_user() from public;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.ensure_monthly_credit_grant(p_user_id uuid) returns void language plpgsql security definer set search_path=public as $$ declare v_start timestamptz; v_end timestamptz; v_credits integer; begin if p_user_id is null or p_user_id<>auth.uid() then raise exception 'Unauthorized'; end if; v_start:=date_trunc('month',now()); v_end:=v_start+interval '1 month'; select coalesce((select p.monthly_credits from public.subscriptions s join public.plans p on p.id=s.plan_id where s.user_id=p_user_id and s.status in ('active','trialing') and s.starts_at<=now() and (s.ends_at is null or s.ends_at>now()) order by s.created_at desc limit 1),(select monthly_credits from public.plans where slug='free' and active=true limit 1),0) into v_credits; if v_credits>0 then insert into public.credit_grants(user_id,source,units,valid_from,valid_until,metadata) values(p_user_id,'monthly_plan',v_credits,v_start,v_end,jsonb_build_object('period',to_char(v_start,'YYYY-MM'))) on conflict(user_id,source,valid_from) do nothing; end if; end; $$;
revoke all on function public.ensure_monthly_credit_grant(uuid) from public;
grant execute on function public.ensure_monthly_credit_grant(uuid) to authenticated;

create or replace function public.consume_credits(p_units integer,p_event_type text,p_metadata jsonb default '{}') returns jsonb language plpgsql security definer set search_path=public as $$ declare v_user uuid:=auth.uid(); v_available integer; v_units integer:=greatest(1,least(coalesce(p_units,1),100000)); v_event uuid; begin if v_user is null then raise exception 'Unauthorized'; end if; if p_event_type is null or length(trim(p_event_type))=0 then raise exception 'event_type required'; end if; perform public.ensure_monthly_credit_grant(v_user); select coalesce(sum(units),0)-coalesce((select sum(units) from public.usage_events where user_id=v_user and created_at>=date_trunc('month',now()) and created_at<date_trunc('month',now())+interval '1 month'),0) into v_available from public.credit_grants where user_id=v_user and valid_from<=now() and valid_until>now(); if v_available<v_units then raise exception 'Insufficient credits'; end if; insert into public.usage_events(user_id,event_type,units,metadata) values(v_user,trim(p_event_type),v_units,coalesce(p_metadata,'{}')) returning id into v_event; return jsonb_build_object('ok',true,'event_id',v_event,'units',v_units,'remaining',v_available-v_units); end; $$;
revoke all on function public.consume_credits(integer,text,jsonb) from public;
grant execute on function public.consume_credits(integer,text,jsonb) to authenticated;

create or replace function public.redeem_promo(p_code text) returns jsonb language plpgsql security definer set search_path=public as $$ declare p public.promo_codes; now_ts timestamptz:=now(); target_plan uuid; begin if auth.uid() is null then raise exception 'Unauthorized'; end if; select * into p from public.promo_codes where upper(code)=upper(trim(p_code)) and active=true for update; if not found then raise exception 'Invalid or inactive promo code'; end if; if p.starts_at>now_ts or (p.expires_at is not null and p.expires_at<now_ts) then raise exception 'Promo code is not currently valid'; end if; if p.max_redemptions is not null and p.redeemed_count>=p.max_redemptions then raise exception 'Promo redemption limit reached'; end if; if exists(select 1 from public.promo_redemptions where promo_id=p.id and user_id=auth.uid()) then raise exception 'Promo already redeemed'; end if; insert into public.promo_redemptions(promo_id,user_id) values(p.id,auth.uid()); update public.promo_codes set redeemed_count=redeemed_count+1 where id=p.id; if p.plan_id is not null then target_plan:=p.plan_id; update public.subscriptions set status='expired',ends_at=now_ts where user_id=auth.uid() and status in ('active','trialing'); insert into public.subscriptions(user_id,plan_id,status,starts_at,ends_at) values(auth.uid(),target_plan,'active',now_ts,now_ts+(p.duration_days||' days')::interval); end if; if p.credits>0 then insert into public.credit_grants(user_id,source,units,valid_from,valid_until,metadata) values(auth.uid(),'promo',p.credits,now_ts,now_ts+(p.duration_days||' days')::interval,jsonb_build_object('promo_id',p.id,'code',p.code)); end if; return jsonb_build_object('success',true,'code',p.code,'credits',p.credits,'duration_days',p.duration_days); end; $$;
revoke all on function public.redeem_promo(text) from public;
grant execute on function public.redeem_promo(text) to authenticated;
