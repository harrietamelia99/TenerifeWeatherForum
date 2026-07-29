import { NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/sendDailyDigest";
import { getManualForecastData } from "@/lib/getManualForecast";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Backup cron — runs at 10am UTC as a safety net.
// Only sends if Kevin has already posted his manual forecast today.
// This prevents a blank "forecast loading" email going out before Kevin writes.
// If Kevin already triggered the send manually, deduplication prevents a double-send.
export async function GET() {
  try {
    // Guard: don't send if Kevin hasn't written today's forecast yet
    const manual = await getManualForecastData();
    if (!manual) {
      console.log("[cron/daily-digest] No manual forecast posted yet — skipping.");
      return NextResponse.json({ ok: true, message: "No forecast posted yet — skipped." });
    }

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
