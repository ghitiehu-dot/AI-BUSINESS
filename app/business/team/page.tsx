import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export default async function BusinessTeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: members } = await supabase.from('business_members').select('id,member_email,role,status,created_at').eq('owner_id', user.id).order('created_at', { ascending: false });
  return <main className="page"><div className="topbar"><Link className="brand" href="/business">AI BUSINESS</Link><Link className="textlink" href="/business">Business hub</Link></div><section className="pagehero"><div className="eyebrow">TEAM</div><h1>People working with your business</h1><p>Keep team access explicit. Invites and role changes can be added without exposing private owner data.</p></section><section className="listgrid">{(members ?? []).map((member) => <article key={member.id}><span>{member.role} · {member.status}</span><h2>{member.member_email}</h2><p>Added {new Date(member.created_at).toLocaleDateString()}</p></article>)}{!(members ?? []).length && <article><span>TEAM READY</span><h2>No team members yet</h2><p>Invite a VA or collaborator when you are ready to delegate work.</p></article>}</section></main>;
}
