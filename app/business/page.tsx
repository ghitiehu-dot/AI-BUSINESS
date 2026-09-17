import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

type BusinessTaskSummary = { status: string };

export default async function BusinessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tasks } = await supabase.from('business_tasks').select('id,title,status,priority,due_at').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(20);
  const taskRows = (tasks ?? []) as BusinessTaskSummary[];
  const open = taskRows.filter((t) => t.status !== 'done').length;
  const done = taskRows.filter((t) => t.status === 'done').length;

  return <main className="page"><div className="topbar"><Link className="brand" href="/dashboard">AI BUSINESS</Link><Link className="textlink" href="/dashboard">Back to dashboard</Link></div>
    <section className="pagehero"><div className="eyebrow">BUSINESS OPERATIONS</div><h1>Run your business with the same workspace your team can use.</h1><p>Plan work, document processes, delegate tasks, and keep approvals and activity in one place.</p></section>
    <div className="cardgrid"><Link className="dashcard" href="/business/tasks"><h3>Tasks</h3><p>{open} open · {done} completed. Assign and track operational work.</p></Link><Link className="dashcard" href="/business/workflows"><h3>Workflows</h3><p>Turn repeatable work into clear steps your team can follow.</p></Link><Link className="dashcard" href="/business/team"><h3>Team</h3><p>Invite people, define roles, and manage delegated work.</p></Link><Link className="dashcard" href="/sops"><h3>SOPs</h3><p>Build a reliable knowledge base for recurring business processes.</p></Link><Link className="dashcard" href="/templates"><h3>Templates</h3><p>Reuse checklists, messages, briefs, and operating documents.</p></Link><Link className="dashcard" href="/ai-guide"><h3>AI Guide</h3><p>Get help turning business requests into practical next steps.</p></Link></div>
  </main>;
}
