import { NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/sendDailyDigest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fallback cron — runs at 11am Canary time in case Kevin hasn't posted yet.
// If Kevin already saved a forecast via the admin page, sendDailyDigest() will
// detect it was already sent and return early without double-sending.
export async function GET() {
  try {
    const result = await sendDailyDigest();

    if (result.alreadySent) {
      return NextResponse.json({ ok: true, message: "Already sent today — skipped." });
    }

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
      subscribers: result.subscribers,
    });
  } catch (err) {
    console.error("[cron/daily-digest] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
