import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export default async function BusinessTasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: tasks } = await supabase.from('business_tasks').select('id,title,description,status,priority,due_at,created_at').eq('owner_id', user.id).order('created_at', { ascending: false });
  return <main className="page"><div className="topbar"><Link className="brand" href="/business">AI BUSINESS</Link><Link className="textlink" href="/business">Business hub</Link></div><section className="pagehero"><div className="eyebrow">OPERATIONS</div><h1>Business tasks</h1><p>Keep work visible, assignable, and easy to review.</p></section><section className="listgrid">{(tasks ?? []).map((task) => <article key={task.id}><span>{task.priority ?? 'normal'} · {task.status}</span><h2>{task.title}</h2><p>{task.description || 'No description.'}</p>{task.due_at && <p>Due {new Date(task.due_at).toLocaleString()}</p>}</article>)}{!(tasks ?? []).length && <article><span>READY</span><h2>No business tasks yet</h2><p>Create your first operational task when the business workflow is ready to begin.</p></article>}</section></main>;
}
