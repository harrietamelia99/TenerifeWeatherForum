import { NextResponse } from "next/server";
import { getForecast } from "@/lib/getForecast";

export const dynamic = "force-dynamic";

/**
 * GET /api/daily-update
 *
 * Returns today's AI-generated forecast.
 * Called by the Vercel cron job at 06:00 UTC and by the ForecastModal.
 */
export async function GET() {
  try {
    const forecast = await getForecast();
    return NextResponse.json(forecast, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[/api/daily-update] Forecast error:", err);
    return NextResponse.json(
      { error: "Could not generate forecast" },
      { status: 500 }
    );
  }
}
