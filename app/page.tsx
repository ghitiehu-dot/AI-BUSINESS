import Link from "next/link";
import { ArrowRight, BookOpen, Bot, BriefcaseBusiness, CheckCircle2, FileText, Gauge, Sparkles } from "lucide-react";
const features = [
  [BookOpen,"VA Starter Guide","A step-by-step path from zero VA experience to practical work."],
  [BriefcaseBusiness,"Practice Workflows","Train on realistic email, calendar, files, research and client tasks."],
  [FileText,"Templates & SOPs","Reusable operating resources for everyday VA work."],
  [Bot,"AI Guide","Get contextual help while learning and practicing."],
  [Gauge,"Usage & Plans","Clear plan limits, credits and usage tracking."],
  [Sparkles,"Owner Promos","Grant access with controlled promo and invitation codes."],
] as const;
export default function Home() { return <main className="landing"><nav><div className="brand"><span className="brandmark">AI</span> BUSINESS</div><div className="navlinks"><Link href="/login">Log in</Link><Link className="button small" href="/create-account">Create account <ArrowRight size={16}/></Link></div></nav><section className="hero"><div className="eyebrow">BEGINNER-FIRST VA WORKSPACE</div><h1>Learn the work.<br/><span>Practice the work.</span><br/>Start your VA career.</h1><p>AI BUSINESS gives aspiring virtual assistants a guided path, practical simulations, reusable tools, and an AI guide—without requiring you to know where to start.</p><div className="actions"><Link className="button" href="/create-account">Start your VA journey <ArrowRight size={18}/></Link><Link className="textlink" href="/guide">See the guide</Link></div><div className="trust"><CheckCircle2 size={16}/> Start with a free account · Upgrade when you need more</div></section><section className="features">{features.map(([Icon,title,desc])=><article key={title}><div className="icon"><Icon size={20}/></div><h3>{title}</h3><p>{desc}</p></article>)}</section><footer>AI BUSINESS · A practical starting point for aspiring virtual assistants.</footer></main> }
