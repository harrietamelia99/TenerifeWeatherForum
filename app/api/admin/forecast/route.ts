import { NextRequest, NextResponse } from "next/server";
import { saveManualForecast } from "@/lib/getManualForecast";
import { sendDailyDigest } from "@/lib/sendDailyDigest";
import { getForecast } from "@/lib/getForecast";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, text, hasWarnings, warnings, warningLevel } = body as {
      password: string;
      text: string;
      hasWarnings: boolean;
      warnings: string;
      warningLevel: "yellow" | "amber" | "red";
    };

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Forecast text is too short." }, { status: 400 });
    }

    if (hasWarnings && (!warnings || warnings.trim().length < 5)) {
      return NextResponse.json({ error: "Please enter the warning details." }, { status: 400 });
    }

    await saveManualForecast(
      text.trim(),
      hasWarnings,
      warnings?.trim() ?? "",
      warningLevel ?? "yellow"
    );

    // Build the forecast object now (KV write is confirmed) and pass it
    // directly to sendDailyDigest to avoid a race condition on the KV read.
    const forecast = await getForecast();

    // Await the send so the serverless function doesn't terminate before
    // emails are dispatched. maxDuration: 60 gives enough headroom.
    // No force flag — sendDailyDigest's "already sent today" guard prevents
    // double-sending if Kevin saves the forecast after the backup cron has run.
    let emailsSent = 0;
    let emailsFailed = 0;
    try {
      const result = await sendDailyDigest(forecast);
      emailsSent = result.sent;
      emailsFailed = result.failed;
      console.log(`[admin/forecast] Digest triggered: sent=${result.sent}, failed=${result.failed}`);
    } catch (err) {
      console.error("[admin/forecast] Digest send failed (non-fatal):", err);
    }

    return NextResponse.json({ ok: true, emailsSent, emailsFailed });
  } catch (err) {
    console.error("[admin/forecast] Error:", err);
    return NextResponse.json({ error: "Failed to save forecast." }, { status: 500 });
  }
}
