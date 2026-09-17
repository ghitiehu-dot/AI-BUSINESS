import { createClient } from "../../lib/supabase/server";
import Link from "next/link";

const fallback=[['free','Free',0,100],['starter','Starter',299,1000],['pro','Pro',699,3000]];

export default async function Plans(){
  const s=await createClient();
  const {data:user}=await s.auth.getUser();
  if(!user.user) return <main className="auth"><div className="authcard"><h1>Plans & Usage</h1><p>Log in to view your workspace usage.</p><Link className="button" href="/login">Log in</Link></div></main>;
  const {data}=await s.from('plans').select('slug,name,monthly_price,monthly_credits').eq('active',true).order('monthly_price');
  const plans=(data&&data.length?data:fallback);
  const {data:sub}=await s.from('subscriptions').select('status,ends_at,plans(name,slug,monthly_credits)').eq('user_id',user.user.id).in('status',['active','trialing']).order('created_at',{ascending:false}).limit(1).maybeSingle();
  const {data:events}=await s.from('usage_events').select('event_type,units').eq('user_id',user.user.id);
  const used=(events??[]).filter(e=>e.event_type!=='promo_credit').reduce((n,e)=>n+Number(e.units||0),0);
  const promo=(events??[]).filter(e=>e.event_type==='promo_credit').reduce((n,e)=>n+Number(e.units||0),0);
  const activePlan=(sub?.plans as any)||{name:'Free',slug:'free',monthly_credits:100};
  const allowance=Number(activePlan.monthly_credits??100)+promo;
  return <main className="page"><header className="topbar"><Link className="brand" href="/">AI BUSINESS</Link><Link href="/dashboard">Dashboard</Link></header><section className="pagehero"><div className="eyebrow">PLANS & USAGE</div><h1>Choose the workspace that fits your stage.</h1><p>Current access: <strong>{activePlan.name}</strong>. {Math.max(0,allowance-used)} credits remaining.</p></section><section className="plans">{plans.map((x:any)=><article key={x.slug}><span>{x.name}</span><strong>₱{x.monthly_price}</strong><h2>{x.slug==='free'?'Start learning':x.slug==='starter'?'Build your skills':'Get client-ready'}</h2><p>{x.monthly_credits} monthly credits for AI and metered operations.</p><button className={x.slug==='starter'?'button':''}>{x.slug===activePlan.slug?'Current plan':'Choose '+x.name}</button></article>)}</section><section className="usagepanel"><h2>Usage</h2><p>{used} metered units used · {promo} promo credits granted · {Math.max(0,allowance-used)} remaining.</p>{sub?.ends_at&&<small>Current access ends {new Date(sub.ends_at).toLocaleDateString()}</small>}</section><section className="usagepanel"><h2>Promo access</h2><p>Owner-issued promo codes can grant credits or time-limited plan access.</p><Link className="button" href="/promos">Redeem a promo code</Link></section></main>}
