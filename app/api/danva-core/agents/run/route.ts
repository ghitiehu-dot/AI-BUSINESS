import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDanvaCore } from "@/lib/danva-core";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "AUTH_REQUIRED" }, { status: 401 });

  const rawBody = await req.text();
  try {
    const body = JSON.parse(rawBody) as { agentId?: string; goal?: string; conversationId?: string };
    if (!String(body.agentId ?? "").trim() || !String(body.goal ?? "").trim()) {
      return NextResponse.json({ success: false, error: "agentId and goal are required" }, { status: 400 });
    }

    const response = await callDanvaCore(
      { id: user.id, email: user.email ?? "", role: "user" },
      "/api/core/agents/run",
      { method: "POST", body: rawBody },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "DANVA_CORE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
