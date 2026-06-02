import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Temporary diagnostic — returns exactly what sendDailyDigest would query
export async function GET() {
  const supabase = createServerClient();

  // Query A: same as old sendDailyDigest (no order, no limit)
  const { data: oldQuery } = await supabase
    .from("subscribers")
    .select("email")
    .eq("daily_digest", true);

  // Query B: new query with order + limit
  const { data: newQuery } = await supabase
    .from("subscribers")
    .select("email")
    .eq("daily_digest", true)
    .order("created_at", { ascending: true })
    .limit(1000);

  // Query C: all subscribers regardless of daily_digest
  const { data: allRows } = await supabase
    .from("subscribers")
    .select("email, daily_digest, monthly_newsletter");

  return NextResponse.json({
    oldQueryCount: oldQuery?.length ?? 0,
    oldQueryEmails: oldQuery?.map((s) => s.email) ?? [],
    newQueryCount: newQuery?.length ?? 0,
    newQueryEmails: newQuery?.map((s) => s.email) ?? [],
    totalRows: allRows?.length ?? 0,
    allRows: allRows ?? [],
  });
}
