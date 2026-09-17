"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function CreateAccount(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("");const supabase=createClient();const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error){setMsg(error.message);setBusy(false);return;}if(data.session){router.push('/onboarding');return;}setMsg("Account created. Check your email if confirmation is enabled, then log in.");setBusy(false)}
  return <main className="auth"><div className="authcard"><Link className="brand" href="/">AI BUSINESS</Link><h1>Create your account</h1><p>Choose whether you want to become a VA, run a business, or manage a team.</p><form onSubmit={submit}><label>Full name<input value={name} onChange={e=>setName(e.target.value)} required /></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Password<input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required /></label><button className="button full" disabled={busy}>{busy?"Creating…":"Create account"}</button></form>{msg&&<div className="notice">{msg}</div>}<p className="switch">Already have an account? <Link href="/login">Log in</Link></p></div></main>
}
