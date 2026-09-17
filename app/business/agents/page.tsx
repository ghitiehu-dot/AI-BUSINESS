import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { AgentConsole } from "../../../components/agent-console";

export default async function BusinessAgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="page">
      <div className="topbar">
        <Link className="brand" href="/business">AI BUSINESS</Link>
        <Link className="textlink" href="/business">Back to business</Link>
      </div>
      <section className="pagehero">
        <div className="eyebrow">DANVA CORE · AI WORKFORCE</div>
        <h1>Your business agents run on DANVA.</h1>
        <p>The business workspace is the clean front end. Agent execution stays in the DANVA core and remains behind an authenticated server-to-server bridge.</p>
      </section>
      <AgentConsole />
    </main>
  );
}
