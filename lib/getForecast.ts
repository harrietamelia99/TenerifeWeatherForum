import type { DailyUpdate } from "@/lib/getDailyUpdate";

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
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,uv_index` +
    `&hourly=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=Atlantic%2FCanary&forecast_days=1`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status} for ${lat},${lon}`);
  const d = await res.json();
  const code: number = d.current.weather_code;
  const temp = Math.round(d.current.temperature_2m);

  // Pick the highest hourly temp between 09:00 and 18:00 local time
  // to get the true afternoon peak rather than the model's daily max.
  const hourlyTemps: number[] = d.hourly?.temperature_2m ?? [];
  const peakHourly = hourlyTemps.slice(9, 19).length > 0
    ? Math.round(Math.max(...hourlyTemps.slice(9, 19)))
    : Math.round(d.daily.temperature_2m_max[0]);
  const dailyMax = Math.round(d.daily.temperature_2m_max[0]);

  return {
    temp,
    // Use the higher of: current, daily max, or hourly afternoon peak
    high:     Math.max(temp, dailyMax, peakHourly),
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

  const prompt = `You are writing the conditions and forecast text for a daily Tenerife weather update. Output factual weather information only — no lifestyle advice, no opinions, no filler.

Today: ${dayName}

Live weather data:
- South (Costa Adeje / Playa de las Américas): ${south.temp}°C now, high ${south.high}°C, low ${south.low}°C, ${south.label}, wind ${south.wind}–${south.gust} km/h, humidity ${south.humidity}%
- North (Santa Cruz / Puerto de la Cruz): ${north.temp}°C now, high ${north.high}°C, low ${north.low}°C, ${north.label}, wind ${north.wind}–${north.gust} km/h, humidity ${north.humidity}%
- El Médano (east coast): ${medano.temp}°C, ${medano.label}, wind ${medano.wind}–${medano.gust} km/h
- Mt Teide summit: ${teide.temp}°C, ${teide.label}

RULES — every rule is mandatory:
1. Every sentence must be directly supported by the data above. Do not invent or infer anything not in the data.
2. No lifestyle suggestions, no health advice, no suncream mentions, no opinions, no greetings, no sign-offs.
3. southConditions and northConditions: 2–3 sentences each. Describe current conditions and how they develop through the day. Vary phrasing each day.
4. forecast: exactly 3 sentences of factual island-wide summary (north/south contrast, temperatures, wind), followed by this exact sentence as sentence 4 — copy it word for word: "Conditions can vary significantly across different parts of the island due to Tenerife's microclimates, and weather can be completely different just 15 minutes away from one location to another."

Return only valid JSON, no markdown, no code fences:
{
  "southConditions": "2–3 factual sentences about south Tenerife conditions today.",
  "northConditions": "2–3 factual sentences about north Tenerife conditions today.",
  "forecast": "3 factual sentences of island-wide summary, then the mandatory microclimate sentence word for word."
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
      temperature: 0.85,
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

async function generate(): Promise<DailyUpdate> {
  try {
    const [south, north, medano, teide] = await Promise.all([
      fetchLoc(28.0573, -16.7146),
      fetchLoc(28.4142, -16.5484),
      fetchLoc(28.0449, -16.5380),
      fetchLoc(28.2723, -16.6423),
    ]);

    let conditions: { southConditions: string; northConditions: string; forecast: string };
    let source = "Auto Template";

    if (process.env.OPENAI_API_KEY) {
      try {
        const ai = await aiForecast(south, north, medano, teide);
        conditions = ai;
        source = "AI Generated";
      } catch (err) {
        // Log the real error so it appears in Vercel function logs
        console.error("[getForecast] OpenAI failed, using template fallback:", err);
        conditions = templateForecast(south, north);
      }
    } else {
      console.warn("[getForecast] OPENAI_API_KEY not set — using template fallback");
      conditions = templateForecast(south, north);
    }

    const warningCodes = [61, 63, 65, 80, 81, 82, 95, 96, 99];
    const hasWarnings = warningCodes.includes(south.code) || warningCodes.includes(north.code);

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
        conditions: conditions.southConditions,
        wind: `${south.wind}–${south.gust} km/h`,
      },
      north: {
        emoji: north.emoji,
        label: "Tenerife North (Santa Cruz / Puerto de la Cruz)",
        temperature: north.temp,
        high: north.high,
        conditions: conditions.northConditions,
        wind: `${north.wind}–${north.gust} km/h`,
      },
      warnings: hasWarnings
        ? "Weather activity expected today — check Met Office forecasts before travelling."
        : "There are no active weather warnings for Tenerife today.",
      hasWarnings,
      forecast: conditions.forecast,
      postedAt: new Date().toISOString(),
      source,
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
