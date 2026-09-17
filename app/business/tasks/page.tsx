'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

type Task = { id:string; title:string; description:string|null; status:string; priority:string; due_at:string|null };

export default function BusinessTasksPage() {
  const [tasks,setTasks]=useState<Task[]>([]); const [title,setTitle]=useState(''); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function load(){const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user)return;const {data,error}=await s.from('business_tasks').select('id,title,description,status,priority,due_at').eq('owner_id',user.id).order('created_at',{ascending:false});if(error)setMessage(error.message);else setTasks(data??[]);}
  useEffect(()=>{void load()},[]);
  async function addTask(e:React.FormEvent){e.preventDefault();if(!title.trim())return;setBusy(true);setMessage('');const s=createClient();const {data:{user}}=await s.auth.getUser();if(!user){setMessage('Please log in.');setBusy(false);return;}const {error}=await s.from('business_tasks').insert({owner_id:user.id,title:title.trim(),description:description.trim()||null});if(error)setMessage(error.message);else{setTitle('');setDescription('');setMessage('Task created.');await load()}setBusy(false)}
  return <main className="page"><div className="topbar"><Link className="brand" href="/business">AI BUSINESS</Link><Link className="textlink" href="/business">Business hub</Link></div><section className="pagehero"><div className="eyebrow">OPERATIONS</div><h1>Business tasks</h1><p>Create, track, and review operational work.</p></section><section className="formpanel"><h2>Create a task</h2><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Prepare weekly sales report" required /></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Context, expected result, deadline, or SOP reference" /></label><button className="button" onClick={addTask} disabled={busy}>{busy?'Creating…':'Create task'}</button>{message&&<div className="notice">{message}</div>}</section><section className="listgrid" style={{marginTop:15}}>{tasks.map(task=><article key={task.id}><span>{task.priority} · {task.status}</span><h2>{task.title}</h2><p>{task.description||'No description.'}</p>{task.due_at&&<p>Due {new Date(task.due_at).toLocaleString()}</p>}</article>)}{!tasks.length&&<article><span>READY</span><h2>No business tasks yet</h2><p>Create the first operational task above.</p></article>}</section></main>;
}
