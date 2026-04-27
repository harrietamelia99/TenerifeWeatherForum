import { NextResponse } from "next/server";
import { getForecast } from "@/lib/getForecast";

/**
 * GET /api/daily-update
 *
 * Returns today's AI-generated forecast.
 * Called by the "Today's Forecast" modal when it opens.
 * Also hit by the Vercel cron job at 07:00 every morning to warm the cache.
 *
 * No auth needed — data is public weather information.
 */
export async function GET() {
  try {
    const forecast = await getForecast();
    return NextResponse.json(forecast, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Forecast error:", err);
    return NextResponse.json(
      { error: "Could not generate forecast" },
      { status: 500 }
    );
  }
}
