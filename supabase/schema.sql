create extension if not exists pgcrypto;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'user' check (role in ('user','admin')), created_at timestamptz not null default now());
create table if not exists public.plans (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, monthly_price numeric(12,2) not null default 0, monthly_credits integer not null default 0, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, plan_id uuid not null references public.plans(id), status text not null default 'active' check(status in ('active','trialing','past_due','canceled','expired')), starts_at timestamptz not null default now(), ends_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.usage_events (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, event_type text not null, units integer not null default 1 check (units>0), metadata jsonb not null default '{}', created_at timestamptz not null default now());
create table if not exists public.promo_codes (id uuid primary key default gen_random_uuid(), code text unique not null, plan_id uuid references public.plans(id), credits integer not null default 0 check(credits>=0), duration_days integer not null default 30 check(duration_days>0), max_redemptions integer, redeemed_count integer not null default 0 check(redeemed_count>=0), starts_at timestamptz not null default now(), expires_at timestamptz, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.promo_redemptions (id uuid primary key default gen_random_uuid(), promo_id uuid not null references public.promo_codes(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, redeemed_at timestamptz not null default now(), unique(promo_id,user_id));

insert into public.plans(slug,name,monthly_price,monthly_credits) values ('free','Free',0,100),('starter','Starter',299,1000),('pro','Pro',699,3000) on conflict(slug) do update set name=excluded.name, monthly_price=excluded.monthly_price, monthly_credits=excluded.monthly_credits;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;

drop policy if exists "profile own" on public.profiles;
create policy "profile own" on public.profiles for select using (id=auth.uid());
drop policy if exists "profile update own" on public.profiles;
create policy "profile update own" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());
create policy "plans public read" on public.plans for select using (active=true);
drop policy if exists "subscription own" on public.subscriptions;
create policy "subscription own" on public.subscriptions for select using (user_id=auth.uid());
drop policy if exists "usage own" on public.usage_events;
create policy "usage own" on public.usage_events for select using (user_id=auth.uid());
drop policy if exists "usage insert own" on public.usage_events;
create policy "usage insert own" on public.usage_events for insert with check (user_id=auth.uid());
create policy "redemption own" on public.promo_redemptions for select using (user_id=auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name') on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.redeem_promo(p_code text) returns jsonb language plpgsql security definer set search_path=public as $$
declare p public.promo_codes; now_ts timestamptz:=now(); target_plan uuid;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  select * into p from public.promo_codes where upper(code)=upper(trim(p_code)) and active=true for update;
  if not found then raise exception 'Invalid or inactive promo code'; end if;
  if p.starts_at>now_ts or (p.expires_at is not null and p.expires_at<now_ts) then raise exception 'Promo code is not currently valid'; end if;
  if p.max_redemptions is not null and p.redeemed_count>=p.max_redemptions then raise exception 'Promo redemption limit reached'; end if;
  if exists(select 1 from public.promo_redemptions where promo_id=p.id and user_id=auth.uid()) then raise exception 'Promo already redeemed'; end if;
  insert into public.promo_redemptions(promo_id,user_id) values(p.id,auth.uid());
  update public.promo_codes set redeemed_count=redeemed_count+1 where id=p.id;
  if p.plan_id is not null then
    target_plan:=p.plan_id;
    update public.subscriptions set status='expired', ends_at=now_ts where user_id=auth.uid() and status in ('active','trialing');
    insert into public.subscriptions(user_id,plan_id,status,starts_at,ends_at) values(auth.uid(),target_plan,'active',now_ts,now_ts+(p.duration_days||' days')::interval);
  end if;
  if p.credits>0 then insert into public.usage_events(user_id,event_type,units,metadata) values(auth.uid(),'promo_credit',p.credits,jsonb_build_object('promo_id',p.id,'code',p.code)); end if;
  return jsonb_build_object('success',true,'code',p.code,'credits',p.credits,'duration_days',p.duration_days);
end; $$;
