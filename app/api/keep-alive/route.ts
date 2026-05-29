import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Lightweight endpoint called daily by an external cron (cron-job.org).
// Runs a minimal Supabase query to prevent the free-tier project from pausing.
export async function GET() {
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[keep-alive] Supabase ping failed:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log("[keep-alive] Supabase ping OK");
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error("[keep-alive] Unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
