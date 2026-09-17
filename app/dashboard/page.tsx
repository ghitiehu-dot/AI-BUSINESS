import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import Link from "next/link";

export default async function Dashboard(){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/login');
  const {data:profile}=await supabase.from('profiles').select('full_name,account_type').eq('id',user.id).maybeSingle();
  const owner=profile?.account_type==='business' || profile?.account_type==='team';
  const {data:tasks}=owner ? await supabase.from('business_tasks').select('id,status').eq('owner_id',user.id) : {data:null};
  const open=(tasks??[]).filter(t=>t.status!=='done').length;
  return <main className="app"><aside><Link className="brand" href="/">AI BUSINESS</Link><nav>
    <Link className="active" href="/dashboard">Overview</Link>
    {owner ? <><Link href="/business">Business Operations</Link><Link href="/business/tasks">Tasks</Link><Link href="/business/workflows">Workflows</Link><Link href="/business/team">Team</Link></> : <><Link href="/guide">VA Guide</Link><Link href="/skills">Skills</Link><Link href="/workflows">Workflows</Link><Link href="/tasks">Practice Tasks</Link><Link href="/templates">Templates</Link><Link href="/sops">SOPs</Link><Link href="/portfolio">Portfolio</Link></>}
    <Link href="/ai-guide">AI Guide</Link><Link href="/plans">Plans & Usage</Link><Link href="/profile">Profile</Link></nav><div className="sidefoot"><Link href="/settings">Settings</Link></div></aside>
    <section className="content"><header className="contenthead"><div><div className="eyebrow">{owner?'BUSINESS WORKSPACE':'YOUR WORKSPACE'}</div><h1>Welcome to AI BUSINESS</h1></div><div className="pill">{owner?'Business':'VA'} account</div></header>
      {owner ? <><section className="welcome"><div><h2>Run the business from one workspace.</h2><p>Track operational work, build repeatable workflows, delegate clearly, and keep your team aligned.</p><Link className="button" href="/business">Open business operations →</Link></div><div className="progress"><strong>{open}</strong><span>Open business tasks</span><small>Tasks assigned to you or your team appear here.</small></div></section><div className="cardgrid"><Link className="dashcard" href="/business/tasks"><h3>Manage tasks</h3><p>Create a clear queue for your business and team.</p></Link><Link className="dashcard" href="/business/workflows"><h3>Build workflows</h3><p>Standardize recurring operations.</p></Link><Link className="dashcard" href="/business/team"><h3>Manage team</h3><p>Delegate work with explicit access.</p></Link><Link className="dashcard" href="/ai-guide"><h3>Ask the AI Guide</h3><p>Turn a business request into an actionable workflow.</p></Link></div></> : <><section className="welcome"><div><h2>Start with the guide.</h2><p>We'll take you through essential VA skills, then let you practice them in realistic workflows.</p><Link className="button" href="/guide">Continue learning →</Link></div><div className="progress"><strong>0%</strong><span>Journey progress</span><div><i style={{width:'0%'}}/></div><small>Complete your first lesson to begin.</small></div></section><div className="cardgrid"><Link className="dashcard" href="/guide"><h3>Continue your guide</h3><p>Start with VA fundamentals.</p></Link><Link className="dashcard" href="/workflows"><h3>Practice a workflow</h3><p>Run a guided business simulation.</p></Link><Link className="dashcard" href="/templates"><h3>Use a template</h3><p>Open reusable VA resources.</p></Link><Link className="dashcard" href="/ai-guide"><h3>Ask the AI Guide</h3><p>Get help while you learn or practice.</p></Link></div></>}
    </section></main>
}
