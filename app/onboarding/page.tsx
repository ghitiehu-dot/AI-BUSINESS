'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const options = [
  { value: 'va', title: 'Become a VA', text: 'Learn skills, practice real workflows, and prepare for clients.' },
  { value: 'business', title: 'Run my business', text: 'Organize operations, workflows, tasks, documents, and delegation.' },
  { value: 'team', title: 'Manage a VA or team', text: 'Delegate work, coordinate people, and review progress.' },
];

export default function Onboarding(){
  const [loading,setLoading]=useState<string|null>(null); const [error,setError]=useState(''); const router=useRouter();
  async function choose(value:string){setLoading(value);setError('');const r=await fetch('/api/profile/account-type',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({account_type:value})});if(!r.ok){const j=await r.json().catch(()=>({}));setError(j.error||'Could not save your choice.');setLoading(null);return;}router.push('/dashboard');}
  return <main className="auth"><section className="authcard"><div className="eyebrow">WELCOME TO AI BUSINESS</div><h1>What are you here to do?</h1><p>Choose the starting experience that fits you. You can change direction later.</p><div className="steps">{options.map(o=><button key={o.value} className="dashcard" onClick={()=>choose(o.value)} disabled={!!loading}><h3>{loading===o.value?'Setting up…':o.title}</h3><p>{o.text}</p></button>)}</div>{error&&<div className="notice error">{error}</div>}</section></main>;
}
