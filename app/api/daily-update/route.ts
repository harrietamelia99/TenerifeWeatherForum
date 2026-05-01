import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getForecast } from "@/lib/getForecast";

export const dynamic = "force-dynamic";

/**
 * GET /api/daily-update
 *
 * Two roles:
 * 1. Vercel cron (06:00 UTC daily) — revalidates the cached forecast tag so
 *    the next call to getForecast() generates fresh AI content for the day.
 * 2. ForecastModal client fetch — returns today's forecast JSON.
 *
 * No auth needed — data is public weather information.
 */
export async function GET() {
  try {
    // Bust the daily cache so getForecast() calls OpenAI fresh right now
    revalidateTag("daily-forecast");

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
