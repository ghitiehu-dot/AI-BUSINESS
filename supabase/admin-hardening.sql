-- Run after schema.sql. Owner can promote the first admin directly in Supabase SQL.
update public.profiles set role='admin' where id = '<OWNER_AUTH_USER_ID>';

alter table public.plans enable row level security;
alter table public.promo_codes enable row level security;
create policy "plans public read" on public.plans for select using (active=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "plans admin write" on public.plans for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "promo admin all" on public.promo_codes for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "admin usage read" on public.usage_events for select using (user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "admin subscriptions read" on public.subscriptions for select using (user_id=auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Safe promo redemption: validates status, date and redemption cap before granting credits/access.
create or replace function public.redeem_promo(p_code text) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_promo promo_codes%rowtype; v_id uuid := auth.uid();
begin
 if v_id is null then raise exception 'unauthorized'; end if;
 select * into v_promo from promo_codes where upper(code)=upper(trim(p_code)) and active=true for update;
 if not found then raise exception 'invalid promo'; end if;
 if v_promo.starts_at>now() or (v_promo.expires_at is not null and v_promo.expires_at<now()) then raise exception 'promo expired or not active'; end if;
 if v_promo.max_redemptions is not null and v_promo.redeemed_count>=v_promo.max_redemptions then raise exception 'promo limit reached'; end if;
 if exists(select 1 from promo_redemptions where promo_id=v_promo.id and user_id=v_id) then raise exception 'promo already redeemed'; end if;
 insert into promo_redemptions(promo_id,user_id) values(v_promo.id,v_id);
 update promo_codes set redeemed_count=redeemed_count+1 where id=v_promo.id;
 insert into usage_events(user_id,event_type,units,metadata) values(v_id,'promo_credit_grant',greatest(v_promo.credits,1),jsonb_build_object('promo_code',v_promo.code,'duration_days',v_promo.duration_days));
 return jsonb_build_object('success',true,'credits',v_promo.credits,'duration_days',v_promo.duration_days);
end; $$;
