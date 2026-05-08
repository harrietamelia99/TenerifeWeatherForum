import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { getForecast } from "@/lib/getForecast";
import { getSeaTemp, WEATHER_LOCATIONS } from "@/lib/getWeather";
import {
  dailyDigestHtml,
  dailyDigestSubject,
  monthlyNewsletterHtml,
  monthlyNewsletterSubject,
} from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TEST_TOKEN = "test-preview-token";

async function generateOutlook(forecast: Awaited<ReturnType<typeof getForecast>>): Promise<string> {
  if (!process.env.OPENAI_API_KEY) return forecast.forecast;
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
            content: `Write a 2-sentence email outlook for Tenerife today.
South: ${forecast.south.temperature}°C now, high ${forecast.south.high}°C, ${forecast.south.conditions}
North: ${forecast.north.temperature}°C now, high ${forecast.north.high}°C, ${forecast.north.conditions}
Forecast: ${forecast.forecast}
Rules: factual, no lifestyle advice, no temperatures in the second sentence, no greetings. Plain sentences only.`,
          },
        ],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? forecast.forecast;
  } catch {
    return forecast.forecast;
  }
}

export async function GET(req: NextRequest) {
  // Basic protection — require ?secret=TWF_2026
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const TO = "harriet@collectivstudio.uk";
  const results: Record<string, string> = {};

  try {
    // ── Daily Digest ──────────────────────────────────────────────────────────
    const loc = WEATHER_LOCATIONS.playaAmericas;
    const [forecast, seaTemp] = await Promise.all([
      getForecast(),
      getSeaTemp(loc.lat, loc.lon),
    ]);
    const aiOutlook = await generateOutlook(forecast);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO,
      subject: `[TEST] ${dailyDigestSubject(forecast)}`,
      html: dailyDigestHtml({ forecast, seaTemp, aiOutlook, subscriberToken: TEST_TOKEN }),
    });
    results.dailyDigest = "sent";
  } catch (err) {
    results.dailyDigest = `failed: ${err}`;
  }

  try {
    // ── Monthly Newsletter ────────────────────────────────────────────────────
    const now = new Date();
    const monthName = now.toLocaleDateString("en-GB", { month: "long", timeZone: "Atlantic/Canary" });
    const year = now.getFullYear();
    const month = `${monthName} ${year}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO,
      subject: `[TEST] ${monthlyNewsletterSubject(month)}`,
      html: monthlyNewsletterHtml({
        month,
        climateOverview: `May in Tenerife brings warm, settled conditions across the island. The south typically sees daytime highs of 24–27°C with consistent sunshine and low rainfall. The north is slightly cooler and cloudier, with temperatures in the 20–23°C range. Sea temperatures rise to around 20–21°C, making it comfortable for swimming.`,
        whatToExpect: `Light summer clothing is suitable for the south, with an extra layer for evenings in the north or at altitude. UV levels are high from May onwards, so sun protection is recommended. Trade winds provide cooling relief on the eastern coast. Early mornings in the north may bring low cloud that typically clears by midday.`,
        eventsHtml: `<p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#053f5c;">Upcoming events in Tenerife — ${`May ${year}`}:</p><ul style="margin:0 0 12px;padding-left:20px;font-size:14px;color:#475569;line-height:2.2;"><li><strong style="color:#053f5c;">10 May 2026</strong> — Corpus Christi Flower Carpet, La Orotava</li><li><strong style="color:#053f5c;">17 May 2026</strong> — Romerías de San Isidro, La Orotava</li><li><strong style="color:#053f5c;">24 May 2026</strong> — Fiesta de Santa Cruz de Tenerife</li></ul><p style="margin:0;font-size:12px;color:#94a3b8;"><a href="https://www.webtenerife.co.uk/events/" style="color:#429ebd;">See full listings at webtenerife.co.uk →</a></p>`,
        subscriberToken: TEST_TOKEN,
      }),
    });
    results.monthlyNewsletter = "sent";
  } catch (err) {
    results.monthlyNewsletter = `failed: ${err}`;
  }

  return NextResponse.json({ ok: true, to: TO, results });
}
