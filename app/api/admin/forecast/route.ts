import { NextRequest, NextResponse } from "next/server";
import { saveManualForecast } from "@/lib/getManualForecast";
import type { DailyUpdate } from "@/lib/getDailyUpdate";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, forecast } = body as {
      password: string;
      forecast: DailyUpdate;
    };

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!forecast?.south?.conditions || !forecast?.north?.conditions || !forecast?.forecast) {
      return NextResponse.json({ error: "Missing required forecast fields." }, { status: 400 });
    }

    await saveManualForecast({
      ...forecast,
      postedAt: new Date().toISOString(),
      source: "Daily Forecast",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/forecast] Error:", err);
    return NextResponse.json({ error: "Failed to save forecast." }, { status: 500 });
  }
}
