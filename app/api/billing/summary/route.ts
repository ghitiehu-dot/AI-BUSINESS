import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await s.rpc('ensure_monthly_credit_grant', { p_user_id: user.id });
  const { data: sub } = await s.from('subscriptions').select('status,starts_at,ends_at,plans(slug,name,monthly_price,monthly_credits)').eq('user_id', user.id).in('status', ['active', 'trialing']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const periodEnd = new Date(periodStart);
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
  const { data: grants } = await s.from('credit_grants').select('units,source').eq('user_id', user.id).lt('valid_from', periodEnd.toISOString()).gt('valid_until', periodStart.toISOString());
  const { data: events } = await s.from('usage_events').select('units,event_type,created_at').eq('user_id', user.id).gte('created_at', periodStart.toISOString()).lt('created_at', periodEnd.toISOString());
  const allowance = (grants ?? []).reduce((n, g) => n + Number(g.units || 0), 0);
  const used = (events ?? []).filter(e => e.event_type !== 'promo_credit' && e.event_type !== 'credit_grant').reduce((n, e) => n + Number(e.units || 0), 0);
  const promoCredits = (grants ?? []).filter(g => g.source === 'promo').reduce((n, g) => n + Number(g.units || 0), 0);
  const plan = sub?.plans as unknown as { slug: string; name: string; monthly_price: number; monthly_credits: number } | null;
  return NextResponse.json({
    plan: plan ?? { slug: 'free', name: 'Free', monthly_price: 0, monthly_credits: 100 },
    subscription: sub ? { status: sub.status, starts_at: sub.starts_at, ends_at: sub.ends_at } : null,
    period: { starts_at: periodStart.toISOString(), ends_at: periodEnd.toISOString() },
    usage: { used, promo_credits: promoCredits, allowance, remaining: Math.max(0, allowance - used) },
  });
}
