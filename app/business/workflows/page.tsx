import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

const workflows = [
  ['Client onboarding', 'Collect the brief, files, access, expectations, and first deliverables.'],
  ['Weekly operations', 'Review priorities, open tasks, blockers, approvals, and upcoming deadlines.'],
  ['Document processing', 'Receive a request, validate the source, process it, review the result, and archive it.'],
  ['Delegation to a VA', 'Turn an owner request into a clear task with context, SOPs, deadline, and approval step.'],
];

export default async function BusinessWorkflowsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <main className="page"><div className="topbar"><Link className="brand" href="/business">AI BUSINESS</Link><Link className="textlink" href="/business">Business hub</Link></div><section className="pagehero"><div className="eyebrow">REPEATABLE WORK</div><h1>Business workflows</h1><p>Start with practical operating patterns, then customize them for your business.</p></section><section className="listgrid">{workflows.map(([title, description]) => <article key={title}><span>WORKFLOW</span><h2>{title}</h2><p>{description}</p><Link className="button small" href="/ai-guide">Build with AI Guide →</Link></article>)}</section></main>;
}
