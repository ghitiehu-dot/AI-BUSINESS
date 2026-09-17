import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '../../../../lib/supabase/server';

const schema = z.object({ plan_slug: z.enum(['free', 'starter', 'pro']) });

export async function POST(req: Request) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  const { data, error } = await s.rpc('create_mock_checkout', { p_plan_slug: body.data.plan_slug });
  if (error) return NextResponse.json({ error: error.message }, { status: error.message.includes('not configured') ? 503 : 400 });
  return NextResponse.json(data, { status: 201 });
}
