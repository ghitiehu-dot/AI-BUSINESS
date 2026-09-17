import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '../../../../lib/supabase/server';

const schema = z.object({ plan_slug: z.enum(['free','starter','pro']) });

export async function POST(req: Request) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  const { data: plan } = await s.from('plans').select('id,slug,name,monthly_price').eq('slug', body.data.plan_slug).eq('active', true).maybeSingle();
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  if (plan.slug === 'free') return NextResponse.json({ checkout_url: '/dashboard', provider: 'free' });
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  if (provider !== 'mock') return NextResponse.json({ error: 'Payment provider is not configured for this environment.' }, { status: 503 });
  const providerSessionId = `mock_${crypto.randomUUID()}`;
  const { data: session, error } = await s.from('billing_checkout_sessions').insert({ user_id: user.id, plan_id: plan.id, provider: 'mock', provider_session_id: providerSessionId, amount: plan.monthly_price, status: 'pending' }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ checkout_url: `/billing/test-checkout?session=${session.id}`, provider: 'mock', session_id: session.id });
}
