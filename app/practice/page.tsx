'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

type Practice = { key: string; title: string; brief: string; steps: string[] };
const practices: Practice[] = [
  { key: 'inbox-triage', title: 'Inbox triage', brief: 'Prioritize a client inbox and draft a concise professional reply.', steps: ['Identify urgent messages', 'Separate action items from FYI messages', 'Draft a clear reply', 'Record the next action'] },
  { key: 'calendar-coordination', title: 'Calendar coordination', brief: 'Coordinate a meeting while respecting availability and time zones.', steps: ['Collect required attendees', 'Check constraints', 'Propose two options', 'Send a confirmation'] },
  { key: 'file-organization', title: 'File organization', brief: 'Design a client folder structure that is easy to maintain.', steps: ['Define top-level folders', 'Choose a naming convention', 'Separate active and archived work', 'Write the handoff note'] },
  { key: 'spreadsheet-qa', title: 'Spreadsheet QA', brief: 'Review sample data for missing, duplicated, or inconsistent values.', steps: ['Check headers and formats', 'Find blanks and duplicates', 'Flag questionable rows', 'Summarize corrections'] },
  { key: 'research-brief', title: 'Research brief', brief: 'Turn verified information into a short client-ready brief.', steps: ['Define the question', 'Gather multiple sources', 'Verify key claims', 'Write a concise summary'] },
  { key: 'client-handoff', title: 'Client handoff', brief: 'Package completed work so another person can continue without guessing.', steps: ['State the outcome', 'List completed actions', 'List open items', 'Attach or reference resources'] },
];

export default function PracticePage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [selected, setSelected] = useState<Practice | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const progress = useMemo(() => Math.round((completed.length / practices.length) * 100), [completed]);

  useEffect(() => { void load(); }, []);
  async function load() {
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) return;
    const { data } = await s.from('learning_progress').select('item_key,status').eq('user_id', user.id).eq('status', 'completed');
    setCompleted((data ?? []).map((row: { item_key: string }) => row.item_key));
  }
  async function finish(item: Practice) {
    setBusy(true); setMessage('');
    const s = createClient();
    const { data: { user } } = await s.auth.getUser();
    if (!user) { setMessage('Please log in first.'); setBusy(false); return; }
    const { error } = await s.from('learning_progress').upsert({ user_id: user.id, item_key: item.key, status: 'completed', score: 100, updated_at: new Date().toISOString() }, { onConflict: 'user_id,item_key' });
    if (error) setMessage(error.message); else { setMessage('Practice completed and progress saved.'); await load(); setSelected(null); }
    setBusy(false);
  }

  return <main className="page">
    <header className="topbar"><Link className="brand" href="/dashboard">AI BUSINESS</Link><span>{completed.length}/{practices.length} complete</span></header>
    <section className="pagehero"><div className="eyebrow">GUIDED PRACTICE</div><h1>Do the work before the client does.</h1><p>Each simulation is business-safe and generic. Your completion is saved to your AI BUSINESS account.</p></section>
    <section className="usagepanel"><strong>{progress}% journey progress</strong><div className="meter"><span>Practice completion</span><div><i style={{ width: `${progress}%` }} /></div></div></section>
    <section className="listgrid" style={{ marginTop: 15 }}>{practices.map(item => <article key={item.key}><span>{completed.includes(item.key) ? 'COMPLETED' : 'READY'}</span><h2>{item.title}</h2><p>{item.brief}</p><button onClick={() => setSelected(item)}>{completed.includes(item.key) ? 'Review' : 'Start practice'}</button></article>)}</section>
    {selected && <section className="formpanel" style={{ marginTop: 15 }}><span className="eyebrow">{selected.title.toUpperCase()}</span><h2>Practice checklist</h2><p>{selected.brief}</p><ol>{selected.steps.map(step => <li key={step} style={{ marginBottom: 8 }}>{step}</li>)}</ol><div className="actions"><button className="button" onClick={() => void finish(selected)} disabled={busy}>{busy ? 'Saving…' : 'Mark completed'}</button><button onClick={() => setSelected(null)}>Close</button></div>{message && <div className="notice">{message}</div>}</section>}
  </main>;
}
