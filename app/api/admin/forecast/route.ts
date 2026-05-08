import { NextRequest, NextResponse } from "next/server";
import { saveManualForecastText } from "@/lib/getManualForecast";
import { sendDailyDigest } from "@/lib/sendDailyDigest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, text } = body as { password: string; text: string };

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Forecast text is too short." }, { status: 400 });
    }

    // Save the forecast text to KV — this makes it live on the site immediately
    await saveManualForecastText(text.trim());

    // Fire the daily digest in the background — safe to call multiple times,
    // the send function won't double-send if it has already gone out today.
    sendDailyDigest()
      .then((result) => {
        if (result.alreadySent) {
          console.log("[admin/forecast] Digest already sent today — not re-sending.");
        } else {
          console.log(`[admin/forecast] Digest triggered: sent=${result.sent}, failed=${result.failed}`);
        }
      })
      .catch((err) => {
        console.error("[admin/forecast] Digest send failed (non-fatal):", err);
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/forecast] Error:", err);
    return NextResponse.json({ error: "Failed to save forecast." }, { status: 500 });
  }
}
