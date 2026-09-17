import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { callDanvaCore } from "../../../../../lib/danva-core";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ success: false, error: "AUTH_REQUIRED" }, { status: 401 });

  try {
    const response = await callDanvaCore(
      { id: user.id, email: user.email ?? "", role: "user" },
      "/api/core/agents",
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
