"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function CreateAccount(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");const supabase=createClient();const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error){setMsg(error.message);setBusy(false);return;}if(data.session){router.push('/onboarding');return;}setMsg("Your account is ready. Check your email if confirmation is enabled, then log in to continue.");setBusy(false)}
  return <main className="auth"><div className="authcard"><Link className="brand" href="/">AI BUSINESS</Link><div className="eyebrow">START FREE</div><h1>Build your path to practical VA work.</h1><p>Create your account and get a guided starting point based on what you want to do—learn VA skills, run a business, or manage a team.</p><form onSubmit={submit}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required /></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required /></label><button className="button full" disabled={busy}>{busy?"Creating your account…":"Create my free account"}</button></form>{msg&&<div className="notice">{msg}</div>}<p className="switch">Already have an account? <Link href="/login">Log in</Link></p></div></main>
}
