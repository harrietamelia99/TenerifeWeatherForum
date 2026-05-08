import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { getSeaTemp, WEATHER_LOCATIONS } from "@/lib/getWeather";
import { dailyDigestHtml, dailyDigestSubject } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function generateOutlook(forecast: Awaited<ReturnType<typeof getForecast>>): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return `${forecast.forecast}`;
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [
          {
            role: "user",
            content: `Write a 2-sentence email outlook for Tenerife today based on this forecast data.
South: ${forecast.south.temperature}°C now, high ${forecast.south.high}°C, ${forecast.south.conditions}
North: ${forecast.north.temperature}°C now, high ${forecast.north.high}°C, ${forecast.north.conditions}
Rules: factual, no lifestyle advice, no temperatures in the second sentence, no greetings. Plain sentences only.`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? forecast.forecast;
  } catch (err) {
    console.error("[daily-digest] AI outlook failed:", err);
    return forecast.forecast;
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get all daily digest subscribers
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("email, unsubscribe_token")
      .eq("daily_digest", true);

    if (error) {
      console.error("[daily-digest] DB error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No subscribers" });
    }

    const loc = WEATHER_LOCATIONS.playaAmericas;
    const [forecast, seaTemp] = await Promise.all([
      getForecast(),
      getSeaTemp(loc.lat, loc.lon),
    ]);

    const aiOutlook = await generateOutlook(forecast);

    // Send emails in batches of 50 (Resend rate limit awareness)
    const BATCH = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH) {
      const batch = subscribers.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (sub) => {
          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: sub.email,
              subject: dailyDigestSubject(forecast),
              html: dailyDigestHtml({
                forecast,
                seaTemp,
                aiOutlook,
                subscriberToken: sub.unsubscribe_token,
              }),
            });
            sent++;
          } catch (err) {
            console.error(`[daily-digest] Failed to send to ${sub.email}:`, err);
            failed++;
          }
        })
      );
    }

    console.log(`[daily-digest] Sent: ${sent}, Failed: ${failed}`);
    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error("[daily-digest] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
