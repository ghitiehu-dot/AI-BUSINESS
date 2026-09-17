import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '../../../../lib/supabase/server';

const schema = z.object({ account_type: z.enum(['va', 'business', 'team']) });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
  const { error } = await supabase.from('profiles').update({ account_type: body.data.account_type }).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (body.data.account_type !== 'va') {
    const { data: existing } = await supabase.from('business_workspaces').select('id').eq('owner_id', user.id).limit(1).maybeSingle();
    if (!existing) {
      const { error: workspaceError } = await supabase.from('business_workspaces').insert({ owner_id: user.id, name: `${user.user_metadata?.full_name || 'My'} Business`, description: 'AI BUSINESS workspace' });
      if (workspaceError) return NextResponse.json({ error: workspaceError.message }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true, account_type: body.data.account_type });
}
