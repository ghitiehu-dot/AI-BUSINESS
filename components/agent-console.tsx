"use client";

import { useEffect, useState } from "react";

type Agent = { id: string; name: string; description?: string; status: string };

type ApiResponse = { success?: boolean; agents?: Agent[]; run?: { output?: string; status?: string }; error?: string };

export function AgentConsole() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/danva-core/agents")
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((data) => {
        if (data.success) setAgents(data.agents ?? []);
        else setMessage(data.error ?? "Unable to load agents.");
      })
      .catch(() => setMessage("DANVA core is unavailable."))
      .finally(() => setLoading(false));
  }, []);

  async function runAgent() {
    const agent = agents[0];
    if (!agent || !goal.trim()) return;
    setRunning(true);
    setMessage("DANVA is working…");
    try {
      const response = await fetch("/api/danva-core/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, goal: goal.trim() }),
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok || !data.success) throw new Error(data.error ?? "Agent run failed.");
      setMessage(data.run?.output || `Run status: ${data.run?.status ?? "queued"}`);
      setGoal("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Agent run failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="cardgrid">
      <div className="dashcard">
        <div className="eyebrow">AI WORKFORCE</div>
        <h3>{loading ? "Loading…" : `${agents.length} DANVA agent${agents.length === 1 ? "" : "s"}`}</h3>
        {agents.map((agent) => <p key={agent.id}><strong>{agent.name}</strong> · {agent.status}<br />{agent.description}</p>)}
      </div>
      <div className="dashcard">
        <div className="eyebrow">OWNER COMMAND</div>
        <h3>Tell the CEO what needs to happen.</h3>
        <textarea aria-label="Business goal" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Example: Prioritize today's client work and identify anything waiting for approval." rows={5} style={{ width: "100%", marginTop: 12 }} />
        <button className="primary" type="button" disabled={running || !goal.trim() || !agents[0]} onClick={runAgent} style={{ marginTop: 12 }}>
          {running ? "Running…" : "Run with DANVA"}
        </button>
        {message && <p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{message}</p>}
      </div>
    </section>
  );
}
