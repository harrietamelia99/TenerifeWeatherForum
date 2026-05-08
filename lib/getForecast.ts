import type { DailyUpdate } from "@/lib/getDailyUpdate";
import { getManualForecast } from "@/lib/getManualForecast";

// Always appended to the forecast — never left to the AI
const MICROCLIMATE_SENTENCE =
  "Conditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another.";

// ─── WMO code helpers ─────────────────────────────────────────────────────────

const WMO_LABEL: Record<number, string> = {
  0: "clear skies", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "freezing fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain",
  80: "light showers", 81: "showers", 82: "heavy showers",
  95: "thunderstorms", 96: "thunderstorms", 99: "thunderstorms with hail",
};

const WMO_EMOJI: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  80: "🌦️", 81: "🌦️", 82: "🌧️",
  95: "⛈️", 96: "⛈️", 99: "⛈️",
};

// ─── Fetch one location from Open-Meteo ──────────────────────────────────────
// Uses hourly temps so we get the actual daytime high, not just
// the model's daily max (which can be inaccurate early in the morning).

async function fetchLoc(lat: number, lon: number) {
  // forecast_days=2 guarantees 48 hourly values — we read today's (indices 0–23)
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,uv_index` +
    `&hourly=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Atlantic%2FCanary&forecast_days=2`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status} for ${lat},${lon}`);
  const d = await res.json();
  const code: number = d.current.weather_code;
  const temp = Math.round(d.current.temperature_2m);
  const dailyMax = Math.round(d.daily.temperature_2m_max[0]);

  // Scan all 24 hourly values for today (indices 0–23 = 00:00–23:00 local time)
  // to find the true daily peak regardless of time of day.
  const hourlyTemps: number[] = Array.isArray(d.hourly?.temperature_2m)
    ? d.hourly.temperature_2m
    : [];
  const todayHourly = hourlyTemps.slice(0, 24);
  const hourlyPeak = todayHourly.length > 0
    ? Math.round(Math.max(...todayHourly))
    : dailyMax;

  // high = the highest of: model daily max, full-day hourly peak, current temp.
  // Including current temp ensures high is never shown below what it actually is.
  const high = Math.max(dailyMax, hourlyPeak, temp);

  console.log(`[fetchLoc ${lat},${lon}] temp=${temp} dailyMax=${dailyMax} hourlyPeak=${hourlyPeak} high=${high}`);
  console.log(`[fetchLoc ${lat},${lon}] today's 24h temps:`, JSON.stringify(todayHourly));

  return {
    temp,
    high,
    low:      Math.round(d.daily.temperature_2m_min[0]),
    wind:     Math.round(d.current.wind_speed_10m),
    gust:     Math.round(d.current.wind_gusts_10m),
    humidity: Math.round(d.current.relative_humidity_2m),
    uv:       Math.round(d.current.uv_index),
    code,
    label:    WMO_LABEL[code] ?? "variable conditions",
    emoji:    WMO_EMOJI[code] ?? "🌤️",
  };
}

// ─── Template forecast (fallback when AI is unavailable) ─────────────────────
// Uses date-seeded variation so it's not word-for-word identical every day.

function templateForecast(
  south: Awaited<ReturnType<typeof fetchLoc>>,
  north: Awaited<ReturnType<typeof fetchLoc>>
) {
  const dayOfWeek = new Date().getDay(); // 0–6, used to pick phrase variants
  const isWarm = south.temp >= 22;
  const southDry = south.code <= 3;
  const northWet = north.code >= 51;

  const southPhrases = southDry
    ? [
        `Largely clear across the south today with ${south.label} through most of the day. High of ${south.high}°C, wind ${south.wind}–${south.gust} km/h.`,
        `The south looks bright with ${south.label} and temperatures reaching ${south.high}°C. Light to moderate winds of ${south.wind}–${south.gust} km/h.`,
        `${south.label.charAt(0).toUpperCase() + south.label.slice(1)} across the south, with a high of ${south.high}°C and winds around ${south.wind}–${south.gust} km/h.`,
      ]
    : [
        `${south.label.charAt(0).toUpperCase() + south.label.slice(1)} expected in the south. High of ${south.high}°C, winds ${south.wind}–${south.gust} km/h.`,
        `The south sees ${south.label} today with highs of ${south.high}°C and winds ${south.wind}–${south.gust} km/h.`,
      ];

  const northPhrases = northWet
    ? [
        `The north is more unsettled with ${north.label} likely at times. High of ${north.high}°C, winds ${north.wind}–${north.gust} km/h.`,
        `Expect ${north.label} in the north today — high of ${north.high}°C with winds ${north.wind}–${north.gust} km/h.`,
      ]
    : [
        `${north.label.charAt(0).toUpperCase() + north.label.slice(1)} across the north. High of ${north.high}°C, winds ${north.wind}–${north.gust} km/h.`,
        `The north sees ${north.label} with a high of ${north.high}°C and winds ${north.wind}–${north.gust} km/h.`,
      ];

  const overviews = [
    `A ${isWarm ? "warm" : "mild"} day across Tenerife. The south stays ${southDry ? "largely dry" : "mixed"} while the north sees ${northWet ? "more cloud and rain" : "similar conditions"}.`,
    `${isWarm ? "Warm" : "Mild"} conditions island-wide today with the usual north–south contrast. ${southDry ? "Dry and bright in the south" : "Mixed skies in the south"}, ${northWet ? "wetter in the north" : "reasonable in the north"}.`,
    `Another ${isWarm ? "warm" : "mild"} day for Tenerife. ${southDry ? "The south enjoys good sunshine" : "The south has mixed conditions"} while ${northWet ? "the north deals with more cloud and rain" : "the north sees similar weather"}.`,
  ];

  const disclaimers = [
    `Remember Tenerife's microclimates mean conditions can vary a lot — completely different weather is possible just 15 minutes' drive away.`,
    `As always with Tenerife, the microclimate effect means you can have sunshine in one resort and cloud the next — always worth checking locally.`,
    `Tenerife's landscape creates big local differences — the weather just 15 minutes away can be completely different, so check before you travel.`,
  ];

  const pick = <T,>(arr: T[]) => arr[dayOfWeek % arr.length];

  return {
    southConditions: pick(southPhrases),
    northConditions: pick(northPhrases),
    forecast: `${pick(overviews)}\n\n${pick(disclaimers)}`,
  };
}

// ─── AI forecast via OpenAI ───────────────────────────────────────────────────

async function aiForecast(
  south: Awaited<ReturnType<typeof fetchLoc>>,
  north: Awaited<ReturnType<typeof fetchLoc>>,
  medano: Awaited<ReturnType<typeof fetchLoc>>,
  teide: Awaited<ReturnType<typeof fetchLoc>>
) {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Atlantic/Canary" });

  const prompt = `You are writing the conditions and forecast text for a daily Tenerife weather update.

Today: ${dayName}

Live weather data:
- South (Costa Adeje / Playa de las Américas): ${south.temp}°C now, high ${south.high}°C, ${south.label}, wind ${south.wind}–${south.gust} km/h
- North (Santa Cruz / Puerto de la Cruz): ${north.temp}°C now, high ${north.high}°C, ${north.label}, wind ${north.wind}–${north.gust} km/h
- El Médano (east coast): ${medano.temp}°C, ${medano.label}, wind ${medano.wind}–${medano.gust} km/h
- Mt Teide summit: ${teide.temp}°C, ${teide.label}

SENTENCE TEST — apply to every sentence before including it:
Can this statement be directly tied to a specific data point (cloud cover, precipitation, wind speed, or visibility)? If not, remove it.

BANNED — reject any sentence containing:
- Subjective feelings: "pleasant", "delightful", "comfortable", "cooler moments", "warmer feeling"
- Human experience language: "enjoying", "catering to", "encourage", "you'll find", "great for"
- Tourism or lifestyle framing: "showcase", "preferences", "atmosphere", "ideal for", "perfect for"
- Any specific temperature or humidity values (shown in separate fields — do not repeat)
- Health or lifestyle advice of any kind

FORMAT:
1. southConditions: 2–3 sentences. Current sky/cloud condition, wind, expected development through the day. No temperatures. No subjective language.
2. northConditions: 2–3 sentences. Same rules as southConditions.
3. forecast: 3 sentences. Factual, flowing description of the island-wide picture and north/south contrast. Must read like a Met Office bulletin — objective and measurable only. No temperatures. No subjective or lifestyle language.

GOOD example: "Overcast across the south with cloud cover expected to persist through the morning. Some breaks possible during the afternoon, with light northerly winds of 6–17 km/h throughout."
BAD example (rejected): "A delightful day with pleasant conditions encouraging outdoor activities. The south is showcasing its finest weather, catering to all preferences."

Return only valid JSON, no markdown, no code fences:
{
  "southConditions": "2–3 factual, data-based sentences. No temperatures. No subjective language.",
  "northConditions": "2–3 factual, data-based sentences. No temperatures. No subjective language.",
  "forecast": "3 factual sentences. Met Office style. No temperatures. No lifestyle language."
}`;

  console.log("[getForecast] Prompt sent to OpenAI:\n", prompt);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    cache: "no-store", // Never cache OpenAI responses — always generate fresh
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

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  const parsed = JSON.parse(content) as {
    southConditions: string;
    northConditions: string;
    forecast: string;
  };
  if (!parsed.southConditions || !parsed.northConditions || !parsed.forecast) {
    throw new Error("OpenAI response missing required fields");
  }
  return parsed;
}

// ─── Shared placeholder ───────────────────────────────────────────────────────

function makePlaceholder(): DailyUpdate {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "Atlantic/Canary",
  });
  return {
    date: dateStr,
    south: { emoji: "🌤️", label: "Tenerife South (Costa Adeje / Playa de las Américas)", temperature: 22, high: 25, conditions: "Forecast loading — check back shortly.", wind: "15–25 km/h" },
    north: { emoji: "⛅", label: "Tenerife North (Santa Cruz / Puerto de la Cruz)", temperature: 18, high: 21, conditions: "Forecast loading — check back shortly.", wind: "18–30 km/h" },
    warnings: "There are no active weather warnings for Tenerife today.",
    hasWarnings: false,
    forecast: "Today's forecast is loading. Please check back shortly.",
    postedAt: new Date().toISOString(),
    source: "Placeholder",
  };
}

// ─── Core generation ──────────────────────────────────────────────────────────
// Checks for Kevin's manually posted forecast first.
// If he hasn't posted today, returns a "coming soon" card with live weather data.

async function generate(): Promise<DailyUpdate> {
  try {
    // 1. Check for today's manual forecast from Kevin
    const manual = await getManualForecast();
    if (manual) return manual;

    // 2. No manual forecast yet — fetch live weather data so temps/wind are still accurate
    const [south, north] = await Promise.all([
      fetchLoc(28.0573, -16.7146),
      fetchLoc(28.4142, -16.5484),
    ]);

    const dateStr = new Date().toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "Atlantic/Canary",
    });

    return {
      date: dateStr,
      south: {
        emoji: south.emoji,
        label: "Tenerife South (Costa Adeje / Playa de las Américas)",
        temperature: south.temp,
        high: south.high,
        conditions: "Kevin's forecast for today will be posted here shortly.",
        wind: `${south.wind}–${south.gust} km/h`,
      },
      north: {
        emoji: north.emoji,
        label: "Tenerife North (Santa Cruz / Puerto de la Cruz)",
        temperature: north.temp,
        high: north.high,
        conditions: "Kevin's forecast for today will be posted here shortly.",
        wind: `${north.wind}–${north.gust} km/h`,
      },
      warnings: "There are no active weather warnings for Tenerife today.",
      hasWarnings: false,
      forecast: "Kevin's full forecast for today will be posted here shortly — check back soon.",
      postedAt: new Date().toISOString(),
      source: "Pending",
    };
  } catch (err) {
    console.error("[getForecast] Unexpected error, returning placeholder:", err);
    return makePlaceholder();
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
// Called fresh on each request. Open-Meteo data is cached 30 min at the
// fetch level; the OpenAI call always runs fresh (cache: no-store).

export const getForecast = generate;
