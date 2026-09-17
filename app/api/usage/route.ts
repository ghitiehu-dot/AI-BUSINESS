import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.event_type || typeof body.event_type !== 'string') return NextResponse.json({ error: 'event_type required' }, { status: 400 });
  const units = Math.max(1, Math.min(100000, Number(body.units) || 1));
  const { data, error } = await s.rpc('consume_credits', { p_units: units, p_event_type: body.event_type, p_metadata: body.metadata ?? {} });
  if (error) return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient credits') ? 402 : 400 });
  return NextResponse.json(data, { status: 201 });
}
