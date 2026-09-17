import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import Link from "next/link";

type BusinessTaskSummary = { status: string };
type ProgressRow = { status: string };

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('full_name,account_type').eq('id', user.id).maybeSingle();
  const owner = profile?.account_type === 'business' || profile?.account_type === 'team';
  const { data: tasks } = owner ? await supabase.from('business_tasks').select('id,status').eq('owner_id', user.id) : { data: null };
  const taskRows = (tasks ?? []) as BusinessTaskSummary[];
  const open = taskRows.filter(t => t.status !== 'done').length;
  const { data: progressRows } = !owner ? await supabase.from('learning_progress').select('status').eq('user_id', user.id) : { data: null };
  const progress = ((progressRows ?? []) as ProgressRow[]).filter(row => row.status === 'completed').length;
  const progressPercent = Math.min(100, Math.round((progress / 6) * 100));

  return <section className="content workspace-dashboard">
    <header className="contenthead"><div><div className="eyebrow">{owner ? 'BUSINESS WORKSPACE' : 'VA WORKSPACE'}</div><h1>Welcome to AI BUSINESS</h1></div><div className="pill">{owner ? 'Business' : 'VA'} account</div></header>
    {owner ? <>
      <section className="welcome"><div><h2>Run the business from one workspace.</h2><p>Track operational work, build repeatable workflows, delegate clearly, and keep your team aligned.</p><Link className="button" href="/business">Open business operations →</Link></div><div className="progress"><strong>{open}</strong><span>Open business tasks</span><small>Tasks assigned to you or your team appear here.</small></div></section>
      <div className="cardgrid"><Link className="dashcard" href="/business/tasks"><h3>Manage tasks</h3><p>Create and track operational work.</p></Link><Link className="dashcard" href="/business/workflows"><h3>Build workflows</h3><p>Standardize recurring operations.</p></Link><Link className="dashcard" href="/business/team"><h3>Manage team</h3><p>Delegate work with explicit access.</p></Link><Link className="dashcard" href="/ai-guide"><h3>Ask the AI Guide</h3><p>Turn a business request into actionable steps.</p></Link></div>
    </> : <>
      <section className="welcome"><div><h2>Build your VA workspace.</h2><p>Learn the fundamentals, practice real workflows, use reusable resources, and prepare for client work.</p><Link className="button" href={progressPercent >= 100 ? '/portfolio' : '/practice'}>{progressPercent >= 100 ? 'Build your portfolio →' : 'Continue practicing →'}</Link></div><div className="progress"><strong>{progressPercent}%</strong><span>Journey progress</span><div><i style={{width:`${progressPercent}%`}}/></div><small>{progress} of 6 guided practices completed.</small></div></section>
      <div className="cardgrid"><Link className="dashcard" href="/guide"><h3>VA Guide</h3><p>Start with the essential VA foundations.</p></Link><Link className="dashcard" href="/practice"><h3>Practice</h3><p>Complete guided simulations and save progress.</p></Link><Link className="dashcard" href="/templates"><h3>Templates</h3><p>Use reusable professional resources.</p></Link><Link className="dashcard" href="/ai-guide"><h3>AI Guide</h3><p>Get help while learning and working.</p></Link></div>
    </>}
  </section>;
}
