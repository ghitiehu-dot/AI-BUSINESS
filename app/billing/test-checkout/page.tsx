'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

function CheckoutContent(){
  const params=useSearchParams();
  const router=useRouter();
  const session=params.get('session');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  async function pay(){
    if(!session)return;
    setBusy(true);setMessage('');
    const s=createClient();
    const {error}=await s.rpc('complete_mock_checkout',{p_session:session});
    if(error)setMessage(error.message);
    else{setMessage('Sandbox payment completed. Subscription activated.');setTimeout(()=>router.push('/plans'),500)}
    setBusy(false);
  }

  return <section className="authcard"><div className="eyebrow">SANDBOX CHECKOUT</div><h1>Test payment</h1><p>This screen simulates a successful payment. No bank, card, GCash, Maya, or other real credentials are used.</p>{session?<><div className="notice">Test session: {session}</div><button className="button full" onClick={pay} disabled={busy}>{busy?'Processing…':'Simulate successful payment'}</button></>:<div className="notice error">Missing checkout session.</div>} {message&&<div className="notice">{message}</div>}<p className="switch"><Link href="/plans">Back to plans</Link></p></section>;
}

export default function TestCheckout(){
  return <main className="auth"><Suspense fallback={<section className="authcard"><div className="eyebrow">SANDBOX CHECKOUT</div><h1>Loading checkout…</h1><p>Please wait.</p></section>}><CheckoutContent /></Suspense></main>;
}
