import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';

export default async function AdminUsers() {
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return <main className="auth"><div className="authcard"><h1>Admin</h1><p>Please log in.</p><Link className="button" href="/login">Log in</Link></div></main>;
  const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role!=='admin')return <main className="page"><section className="empty"><h2>Admin access required</h2><p>This area is restricted to owners/admins.</p></section></main>;
  const {data}=await s.rpc('admin_operational_summary');
  const summary=(data??{}) as Record<string,number>;
  return <main className="page"><header className="topbar"><Link className="brand" href="/admin">AI BUSINESS</Link><Link href="/dashboard">Workspace</Link></header><section className="pagehero"><div className="eyebrow">OWNER CONTROL</div><h1>Users & operations.</h1><p>Operational counts only. Private workspace content is not exposed by this dashboard.</p></section><section className="listgrid"><article><span>USERS</span><h2>{summary.users??0}</h2><p>Total registered accounts.</p></article><article><span>VA</span><h2>{summary.va_accounts??0}</h2><p>Accounts using the VA journey.</p></article><article><span>BUSINESS</span><h2>{summary.business_accounts??0}</h2><p>Business workspace accounts.</p></article><article><span>TEAM</span><h2>{summary.team_accounts??0}</h2><p>Team-management accounts.</p></article><article><span>30-DAY USAGE</span><h2>{summary.usage_events_30d??0}</h2><p>Usage events recorded in the last 30 days.</p></article></section></main>;
}
