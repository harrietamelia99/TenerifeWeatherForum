import { NextRequest, NextResponse } from "next/server";
import { saveManualForecastText } from "@/lib/getManualForecast";

export const dynamic = "force-dynamic";

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

    await saveManualForecastText(text.trim());

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/forecast] Error:", err);
    return NextResponse.json({ error: "Failed to save forecast." }, { status: 500 });
  }
}
