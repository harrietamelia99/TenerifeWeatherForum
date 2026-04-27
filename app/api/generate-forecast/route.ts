import { NextRequest, NextResponse } from "next/server";
import type { DailyUpdate } from "@/lib/getDailyUpdate";

/**
 * GET /api/generate-forecast
 *
 * Called automatically by Vercel Cron every morning at 07:00 Canary Islands time.
 * Can also be triggered manually by visiting the URL with ?secret=CRON_SECRET.
 *
 * Flow:
 *   1. Fetch live weather from Open-Meteo for South, North, El Médano, Mount Teide
 *   2. If OPENAI_API_KEY is set → generate a human-style forecast with GPT-4o-mini
 *      Otherwise → build a clean template-based forecast from the data
 *   3. Write the structured JSON to content/daily-update.json in GitHub
 *   4. Vercel detects the commit and auto-deploys (~60 seconds)
 *
 * Required env vars (add in Vercel → Settings → Environment Variables):
 *   CRON_SECRET          — random string; Vercel sends this automatically for crons
 *   GITHUB_TOKEN         — fine-grained PAT, Contents read+write on this repo
 *   GITHUB_REPO          — e.g. "harrietamelia99/TenerifeWeatherForum"
 *   GITHUB_BRANCH        — default "main"
 *
 * Optional:
 *   OPENAI_API_KEY       — if set, uses GPT-4o-mini for natural-language forecast
 */

const FILE_PATH = "content/daily-update.json";

// ─── Weather fetch helpers ────────────────────────────────────────────────────

const WMO: Record<number, string> = {
  0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "freezing fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain",
  71: "light snow", 73: "snow", 75: "heavy snow",
  80: "light showers", 81: "showers", 82: "heavy showers",
  95: "thunderstorms", 96: "thunderstorms", 99: "thunderstorms with hail",
};

const EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "🌨️", 73: "🌨️", 75: "❄️",
  80: "🌦️", 81: "🌦️", 82: "🌧️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

interface LocationData {
  name: string;
  label: string;
  temp: number;
  high: number;
  low: number;
  wind: number;
  windGust: number;
  humidity: number;
  uv: number;
  code: number;
  condition: string;
  emoji: string;
}

async function fetchLocation(
  name: string,
  label: string,
  lat: number,
  lon: number
): Promise<LocationData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Atlantic%2FCanary&forecast_days=1`;

  const res = await fetch(url);
  const d = await res.json();
  const code: number = d.current.weather_code;

  return {
    name,
    label,
    temp: Math.round(d.current.temperature_2m),
    high: Math.round(d.daily.temperature_2m_max[0]),
    low: Math.round(d.daily.temperature_2m_min[0]),
    wind: Math.round(d.current.wind_speed_10m),
    windGust: Math.round(d.current.wind_gusts_10m),
    humidity: Math.round(d.current.relative_humidity_2m),
    uv: Math.round(d.current.uv_index),
    code,
    condition: WMO[code] ?? "variable conditions",
    emoji: EMOJI[code] ?? "🌤️",
  };
}

// ─── Template forecast (no OpenAI key needed) ─────────────────────────────────

function buildTemplateForecast(south: LocationData, north: LocationData, teide: LocationData): string {
  const southDesc = south.code <= 2 ? "dry and sunny" : south.code <= 3 ? "mostly cloudy but dry" : "unsettled with rain possible";
  const northDesc = north.code <= 2 ? "bright and largely dry" : north.code <= 3 ? "cloudy with dry intervals" : "cloudy with rain or drizzle likely";
  const uvNote = south.uv >= 8 ? " UV levels are very high today — SPF 50+ essential." : south.uv >= 6 ? " UV levels are high — sun protection recommended." : "";

  return `Temperatures will remain ${south.temp >= 25 ? "warm" : south.temp >= 20 ? "pleasant" : "mild"} across the island today with the typical north–south split continuing. The south looks ${southDesc} with highs of ${south.high}°C. The north is ${northDesc} with highs around ${north.high}°C.${uvNote}

Conditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another.`;
}

// ─── OpenAI forecast ─────────────────────────────────────────────────────────

async function buildAIForecast(
  south: LocationData,
  north: LocationData,
  teide: LocationData,
  medano: LocationData
): Promise<{ southConditions: string; northConditions: string; forecast: string }> {
  const prompt = `You write daily weather updates for a Tenerife travel forum. Write in a friendly, informative, British English style — warm but authoritative, like a local expert. No hyperbole. Keep it concise.

Here is today's live weather data:

SOUTH (Playa de las Américas / Costa Adeje):
- Current temp: ${south.temp}°C | High: ${south.high}°C | Low: ${south.low}°C
- Conditions: ${south.condition}
- Wind: ${south.wind}–${south.windGust} km/h | UV: ${south.uv} | Humidity: ${south.humidity}%

NORTH (Santa Cruz / Puerto de la Cruz):
- Current temp: ${north.temp}°C | High: ${north.high}°C | Low: ${north.low}°C
- Conditions: ${north.condition}
- Wind: ${north.wind}–${north.windGust} km/h

EL MÉDANO:
- Temp: ${medano.temp}°C | Wind: ${medano.wind}–${medano.windGust} km/h | Conditions: ${medano.condition}

MOUNT TEIDE:
- Temp: ${teide.temp}°C | Conditions: ${teide.condition}

Return JSON only (no markdown, no explanation):
{
  "southConditions": "2-3 sentences describing south Tenerife conditions for today",
  "northConditions": "2-3 sentences describing north Tenerife conditions for today",
  "forecast": "2 paragraph forecast summary covering the whole island. Paragraph 1: overview of today. Paragraph 2: always end with the standard microclimate disclaimer sentence."
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(raw);
}

// ─── GitHub write ─────────────────────────────────────────────────────────────

async function writeToGitHub(update: DailyUpdate): Promise<void> {
  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPO ?? "harrietamelia99/TenerifeWeatherForum";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  const getRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${FILE_PATH}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  const currentSha = getRes.ok ? (await getRes.json()).sha : undefined;

  const putRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Auto forecast — ${update.date}`,
        content: Buffer.from(JSON.stringify(update, null, 2)).toString("base64"),
        sha: currentSha,
        branch,
      }),
    }
  );

  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(`GitHub write failed: ${JSON.stringify(err)}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Authenticate — Vercel passes CRON_SECRET automatically; manual calls need ?secret=
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");

  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManual = cronSecret && querySecret === cronSecret;

  if (cronSecret && !isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch weather data in parallel
    const [south, north, medano, teide] = await Promise.all([
      fetchLocation("South Tenerife", "Tenerife South (Costa Adeje / Playa de las Américas)", 28.0573, -16.7146),
      fetchLocation("North Tenerife", "Tenerife North (Santa Cruz / Puerto de la Cruz)", 28.4142, -16.5484),
      fetchLocation("El Médano", "El Médano", 28.0449, -16.5380),
      fetchLocation("Mount Teide", "Mount Teide", 28.2723, -16.6423),
    ]);

    // 2. Generate conditions text
    let southConditions: string;
    let northConditions: string;
    let forecast: string;

    if (process.env.OPENAI_API_KEY) {
      const ai = await buildAIForecast(south, north, teide, medano);
      southConditions = ai.southConditions;
      northConditions = ai.northConditions;
      forecast = ai.forecast;
    } else {
      // Template fallback — works with no API key
      southConditions = `${south.emoji} ${south.condition.charAt(0).toUpperCase() + south.condition.slice(1)} across the south. Temperatures reaching a high of ${south.high}°C with winds of ${south.wind}–${south.windGust} km/h.`;
      northConditions = `${north.emoji} ${north.condition.charAt(0).toUpperCase() + north.condition.slice(1)} in the north. High of ${north.high}°C with winds of ${north.wind}–${north.windGust} km/h.`;
      forecast = buildTemplateForecast(south, north, teide);
    }

    // Check for any "bad weather" warnings
    const warningCodes = [61, 63, 65, 80, 81, 82, 95, 96, 99];
    const hasWarnings = warningCodes.includes(south.code) || warningCodes.includes(north.code);

    // 3. Build the structured update
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "Atlantic/Canary",
    });

    const update: DailyUpdate = {
      date: dateStr,
      south: {
        emoji: south.emoji,
        label: south.label,
        temperature: south.temp,
        high: south.high,
        conditions: southConditions,
        wind: `${south.wind}–${south.windGust} km/h`,
      },
      north: {
        emoji: north.emoji,
        label: north.label,
        temperature: north.temp,
        high: north.high,
        conditions: northConditions,
        wind: `${north.wind}–${north.windGust} km/h`,
      },
      warnings: hasWarnings
        ? `Weather activity expected today. Please check official Met Office forecasts before travelling.`
        : "There are no active weather warnings for Tenerife today.",
      hasWarnings,
      forecast,
      postedAt: now.toISOString(),
      source: process.env.OPENAI_API_KEY ? "AI Generated" : "Auto Template",
    };

    // 4. Write to GitHub (triggers Vercel redeploy)
    if (process.env.GITHUB_TOKEN) {
      await writeToGitHub(update);
    }

    return NextResponse.json({ ok: true, date: update.date, source: update.source });
  } catch (err) {
    console.error("Forecast generation error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
