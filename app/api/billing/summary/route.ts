import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: sub } = await s.from("subscriptions").select("status,starts_at,ends_at,plans(slug,name,monthly_price,monthly_credits)").eq("user_id", user.id).in("status", ["active","trialing"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: events } = await s.from("usage_events").select("units,event_type,created_at,metadata").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  const used = (events ?? []).filter(e => e.event_type !== "promo_credit").reduce((n,e) => n + Number(e.units || 0), 0);
  const credits = (events ?? []).filter(e => e.event_type === "promo_credit").reduce((n,e) => n + Number(e.units || 0), 0);
  const plan = sub?.plans as unknown as {slug:string;name:string;monthly_price:number;monthly_credits:number} | null;
  const allowance = Number(plan?.monthly_credits ?? 100);
  return NextResponse.json({ plan: plan ?? {slug:"free",name:"Free",monthly_price:0,monthly_credits:100}, subscription: sub ? {status:sub.status,starts_at:sub.starts_at,ends_at:sub.ends_at} : null, usage: {used, promo_credits:credits, allowance, remaining:Math.max(0, allowance + credits - used)} });
}
